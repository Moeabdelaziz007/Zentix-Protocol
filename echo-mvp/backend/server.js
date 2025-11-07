// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for users and posts (in a real app, you would use a database)
let users = new Map();
let posts = new Map();
let postCounter = 1;

// Mock wallet for the backend (owner of the smart contract)
// In a real implementation, you would use a secure wallet
const privateKey = process.env.BACKEND_WALLET_PRIVATE_KEY || '0x0123456789012345678901234567890123456789012345678901234567890123';
const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_GOERLI_URL || 'https://goerli.base.org');
const wallet = new ethers.Wallet(privateKey, provider);

// Mock contract ABI (simplified for this example)
const contractABI = [
  "function distributeReward(address recipient, uint256 amount) external",
  "event RewardDistributed(address indexed recipient, uint256 amount)"
];

// Mock contract address (replace with actual deployed address)
const contractAddress = process.env.REWARDS_POOL_ADDRESS || '0x0000000000000000000000000000000000000000';
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// User login endpoint
app.post('/api/user/login', (req, res) => {
  try {
    const { userAddress } = req.body;
    
    // Validate input
    if (!userAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'User address is required' 
      });
    }
    
    // Validate Ethereum address
    if (!ethers.utils.isAddress(userAddress)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid user address' 
      });
    }
    
    // Check if user already exists
    if (!users.has(userAddress)) {
      // Create new user
      users.set(userAddress, {
        address: userAddress,
        createdAt: new Date().toISOString(),
        postCount: 0,
        echoCount: 0
      });
    }
    
    // Return user info
    const user = users.get(userAddress);
    res.json({
      success: true,
      user: {
        address: user.address,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process login',
      details: error.message
    });
  }
});

// Create post endpoint
app.post('/api/posts', (req, res) => {
  try {
    const { author, content } = req.body;
    
    // Validate input
    if (!author || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Author and content are required' 
      });
    }
    
    // Validate Ethereum address
    if (!ethers.utils.isAddress(author)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid author address' 
      });
    }
    
    // Create new post
    const postId = postCounter++;
    const post = {
      id: postId,
      author: author,
      content: content,
      timestamp: new Date().toISOString(),
      echoes: 0
    };
    
    posts.set(postId, post);
    
    // Update user post count
    if (users.has(author)) {
      users.get(author).postCount++;
    }
    
    res.json({
      success: true,
      post: post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create post',
      details: error.message
    });
  }
});

// Echo post endpoint
app.post('/api/posts/:postId/echo', async (req, res) => {
  try {
    const { postId } = req.params;
    const { echoer } = req.body;
    
    // Validate input
    if (!echoer) {
      return res.status(400).json({ 
        success: false, 
        error: 'Echoer address is required' 
      });
    }
    
    // Validate Ethereum address
    if (!ethers.utils.isAddress(echoer)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid echoer address' 
      });
    }
    
    // Check if post exists
    const post = posts.get(parseInt(postId));
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        error: 'Post not found' 
      });
    }
    
    // Check if user has already echoed this post (in a real app, you would store this)
    // For this MVP, we'll just allow multiple echoes
    
    // Update post echo count
    post.echoes++;
    
    // Update user echo count
    if (users.has(echoer)) {
      users.get(echoer).echoCount++;
    }
    
    // AI Quality Check (Simple simulation)
    // In a real implementation, you would call an AI service like Hugging Face
    const isQualityContent = contentQualityCheck(post.content);
    
    let rewarded = false;
    if (isQualityContent) {
      // Distribute reward to post creator
      try {
        // In a real implementation, we would call the smart contract here
        // For this MVP, we'll simulate the transaction
        console.log(`Distributing 1 token reward to ${post.author}`);
        
        // Simulate contract call
        // const tx = await contract.distributeReward(post.author, ethers.utils.parseUnits("1", 18));
        // await tx.wait();
        
        rewarded = true;
      } catch (rewardError) {
        console.error('Error distributing reward:', rewardError);
      }
    }
    
    res.json({
      success: true,
      message: `Successfully echoed post ${postId}`,
      rewarded: rewarded,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error echoing post:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to echo post',
      details: error.message
    });
  }
});

// Simple content quality check (simulation)
function contentQualityCheck(content) {
  // In a real implementation, you would call an AI service
  // For this MVP, we'll use a simple heuristic
  const positiveWords = ['good', 'great', 'awesome', 'excellent', 'amazing', 'wonderful', 'fantastic'];
  const contentLower = content.toLowerCase();
  
  // Check if content contains positive words
  return positiveWords.some(word => contentLower.includes(word));
}

// Get posts endpoint
app.get('/api/posts', (req, res) => {
  try {
    // Convert map to array and sort by timestamp (newest first)
    const postsArray = Array.from(posts.values()).sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    res.json({
      success: true,
      posts: postsArray
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch posts',
      details: error.message
    });
  }
});

// Test endpoint for reward distribution
app.post('/api/test-reward', async (req, res) => {
  try {
    const { recipient, amount } = req.body;
    
    // Validate input
    if (!recipient || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Recipient address and amount are required' 
      });
    }
    
    // Validate Ethereum address
    if (!ethers.utils.isAddress(recipient)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid recipient address' 
      });
    }
    
    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid amount' 
      });
    }
    
    // In a real implementation, we would call the smart contract here
    // For this MVP, we'll simulate the transaction
    console.log(`Distributing ${amount} tokens to ${recipient}`);
    
    // Simulate contract call
    // const tx = await contract.distributeReward(recipient, ethers.utils.parseUnits(amount.toString(), 18));
    // await tx.wait();
    
    // For MVP, we'll just return a simulated success
    res.json({
      success: true,
      message: `Successfully distributed ${amount} tokens to ${recipient}`,
      // transactionHash: tx.hash,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error distributing reward:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to distribute reward',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'echo-backend',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Echo Backend Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log('\nAvailable endpoints:');
  console.log(`  POST /api/user/login        - User login`);
  console.log(`  POST /api/posts             - Create a new post`);
  console.log(`  POST /api/posts/:id/echo    - Echo a post`);
  console.log(`  GET  /api/posts             - Get all posts`);
  console.log(`  POST /api/test-reward       - Test reward distribution`);
  console.log(`  GET  /health                - Health check`);
});

export default app;