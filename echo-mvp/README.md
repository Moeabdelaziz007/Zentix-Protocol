# Echo - Web3 Social Media MVP

Echo is a Web3 social media application where users are rewarded with cryptocurrency for creating and engaging with content. This MVP demonstrates the core functionality of the platform.

## Project Structure

```
echo-mvp/
├── contracts/     # Smart contracts (Solidity)
├── backend/       # Backend service (Node.js/Express)
└── frontend/      # Frontend application (React/HTML)
```

## Phase 1: Core Infrastructure & Smart Contract

### Smart Contract (RewardsPool.sol)

The smart contract is built with Solidity and uses OpenZeppelin's Ownable contract for access control. Key features include:

- Owner authorization for distributing funds
- Deposit function to fund the contract with reward tokens
- Core `distributeReward` function to send rewards to users
- Events for tracking reward distributions

### Backend Service

The backend is built with Node.js and Express.js. Key features include:

- Secure wallet management for the backend owner
- API endpoints for user login, post creation, and echoing posts
- Integration with the RewardsPool smart contract
- Simulated AI quality checks for content

## Phase 2: User-Facing MVP Application

### User Onboarding & Wallet Creation

The frontend includes:

- "Sign in with Coinbase" functionality
- User wallet creation/retrieval through the backend
- Display of user wallet address and balance

### Core Social & Reward Functionality

The frontend includes:

- Feed to display posts
- Form to create new text-based posts
- "Echo" (upvote) functionality for posts
- Real-time balance updates when rewards are distributed

## Setup and Deployment

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Ethereum wallet with Base Goerli testnet funds
- Coinbase Developer Platform account

### Smart Contracts

1. Navigate to the contracts directory:
   ```bash
   cd echo-mvp/contracts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile the contracts:
   ```bash
   npm run compile
   ```

4. Deploy to Base Goerli testnet:
   ```bash
   npm run deploy:base-goerli
   ```

### Backend Service

1. Navigate to the backend directory:
   ```bash
   cd echo-mvp/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```env
   PORT=3001
   BASE_GOERLI_URL=https://goerli.base.org
   BACKEND_WALLET_PRIVATE_KEY=your_private_key_here
   REWARDS_POOL_ADDRESS=deployed_contract_address
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Application

1. Navigate to the frontend directory:
   ```bash
   cd echo-mvp/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:3000`

## API Endpoints

### Backend

- `POST /api/user/login` - User login and wallet setup
- `POST /api/posts` - Create a new post
- `POST /api/posts/:id/echo` - Echo (upvote) a post
- `GET /api/posts` - Get all posts
- `POST /api/test-reward` - Test reward distribution
- `GET /health` - Health check

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (React)
- **Backend**: Node.js, Express.js
- **Blockchain**: Base (Goerli Testnet)
- **Smart Contracts**: Solidity, OpenZeppelin
- **Wallet Integration**: Coinbase Wallet as a Service (WaaS)
- **AI Integration**: Simulated sentiment analysis

## Next Steps

1. Integrate with Coinbase Wallet as a Service (WaaS) for full wallet functionality
2. Implement real AI quality checks using Hugging Face or OpenAI APIs
3. Add image support for posts
4. Implement real-time updates using WebSockets
5. Add user profiles and follow functionality
6. Deploy to production environment