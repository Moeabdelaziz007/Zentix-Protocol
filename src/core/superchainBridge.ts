/**
 * MIT License
 * 
 * Copyright (c) 2025 Mohamed Hossameldin Abdelaziz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Contact Information:
 * Mohamed Hossameldin Abdelaziz
 * Email: Mabdela1@students.kennesaw.edu
 * Alternate Email: Amrikyy@gmail.com
 * Phone: +201094228044
 * WhatsApp: +17706160211
 * LinkedIn: https://www.linkedin.com/in/mohamed-abdelaziz-815797347/
 */

// src/core/superchainBridge.ts
import { EventEmitter } from 'events';
import { quantumSynchronizer } from './quantumSynchronizer';
import { ethers } from 'ethers';
import { MetaSelfMonitoringLoop } from '../../core/monitoring/metaSelfMonitoringLoop';

// ConsciousDecisionLogger contract ABI with cross-chain support
const CONSCIOUS_DECISION_LOGGER_ABI = [
  "function logConsciousDecision(string agentId, string project, string[] collaborators, string skillsJson, string rolesJson, string consciousnessState, string dnaExpression) returns (uint256)",
  "function logCrossChainDecision(string agentId, string project, string[] collaborators, string skillsJson, string rolesJson, string consciousnessState, string dnaExpression)",
  "function sendDecisionToChain(uint256 destinationChainId, address destinationContract, uint256 decisionId) returns (uint256)",
  "function authorizeSender(address sender)",
  "function getDecision(uint256 decisionId) view returns (tuple(string agentId, string project, string[] collaborators, string skillsJson, string rolesJson, string consciousnessState, string dnaExpression, uint256 timestamp, address executor, uint256 sourceChainId, address sourceContract))",
  "function getTotalDecisions() view returns (uint256)",
  "event ConsciousDecisionLogged(uint256 indexed decisionId, string agentId, string project, uint256 timestamp, address indexed executor)",
  "event CrossChainDecisionInitiated(uint256 indexed decisionId, uint256 indexed destinationChainId, address indexed destinationContract, uint256 nonce)",
  "event CrossChainDecisionReceived(uint256 indexed decisionId, uint256 indexed sourceChainId, address indexed sourceContract)"
];

// ConsciousAgentRegistry contract ABI
const CONSCIOUS_AGENT_REGISTRY_ABI = [
  "function registerAgent(string agentId, string name, string description, string[] capabilities, uint256[] chainIds, address[] contractAddresses)",
  "function updateAgent(string agentId, string name, string description, string[] capabilities)",
  "function addAgentChain(string agentId, uint256 chainId, address contractAddress)",
  "function deactivateAgent(string agentId)",
  "function reactivateAgent(string agentId)",
  "function getAgent(string agentId) view returns (tuple(string agentId, string name, string description, string[] capabilities, uint256[] chainIds, address[] contractAddresses, uint256 registrationTimestamp, bool isActive))",
  "function getAgentByContract(uint256 chainId, address contractAddress) view returns (string)",
  "function isAgentActive(string agentId) view returns (bool)",
  "function isAuthorizedAgentContract(uint256 chainId, address contractAddress) view returns (bool)",
  "event AgentRegistered(string indexed agentId, string name, uint256[] chainIds, address[] contractAddresses)",
  "event AgentUpdated(string indexed agentId, string name)",
  "event AgentDeactivated(string indexed agentId)",
  "event AgentReactivated(string indexed agentId)"
];

// Contract addresses (these would be the deployed addresses)
const CONSCIOUS_DECISION_LOGGER_ADDRESS = "0x1234567890123456789012345678901234567890"; // Placeholder
const CONSCIOUS_AGENT_REGISTRY_ADDRESS = "0x0987654321098765432109876543210987654321"; // Placeholder

interface SuperchainMessage {
  id: string;
  from: string;
  to: string;
  payload: any;
  timestamp: number;
  chainId?: number;
}

interface ChainConnection {
  provider: ethers.providers.JsonRpcProvider;
  wallet: ethers.Wallet;
  decisionLogger: ethers.Contract;
  agentRegistry: ethers.Contract;
}

class SuperchainBridge extends EventEmitter {
  private connectedChains: Map<number, { name: string; connection: ChainConnection }>;
  private messageQueue: SuperchainMessage[];
  
  constructor() {
    super();
    this.connectedChains = new Map();
    this.messageQueue = [];
    console.log('🌉 Superchain Bridge initialized');
    
    // Connect Quantum Synchronizer to Superchain Bridge
    this.connectQuantumSynchronizer();
  }
  
  // Connect to a Superchain network
  async connectToChain(
    chainId: number, 
    chainName: string, 
    rpcUrl: string, 
    privateKey: string,
    decisionLoggerAddress: string = CONSCIOUS_DECISION_LOGGER_ADDRESS,
    agentRegistryAddress: string = CONSCIOUS_AGENT_REGISTRY_ADDRESS
  ) {
    try {
      // Create provider and wallet
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      
      // Create contract instances
      const decisionLogger = new ethers.Contract(
        decisionLoggerAddress,
        CONSCIOUS_DECISION_LOGGER_ABI,
        wallet
      );
      
      const agentRegistry = new ethers.Contract(
        agentRegistryAddress,
        CONSCIOUS_AGENT_REGISTRY_ABI,
        wallet
      );
      
      // Store connection
      this.connectedChains.set(chainId, {
        name: chainName,
        connection: {
          provider,
          wallet,
          decisionLogger,
          agentRegistry
        }
      });
      
      console.log(`🔗 Connected to Superchain ${chainName} (Chain ID: ${chainId})`);
      this.emit('chain-connected', { chainId, chainName });
      
      // Notify meta self-monitoring loop of new chain connection
      MetaSelfMonitoringLoop.observeCognitiveProcess({
        id: `chain-connect-${chainId}-${Date.now()}`,
        agentId: 'SuperchainBridge',
        processType: 'chain-connection',
        startTime: Date.now(),
        inputs: [{ chainId, chainName, rpcUrl }],
        outputs: [{ connected: true }],
        confidence: 1.0,
        resourcesUsed: {
          cpu: 0,
          memory: 0,
          network: 0
        },
        decisionPath: ['validate-connection', 'create-provider', 'create-contracts', 'store-connection']
      });
    } catch (error) {
      console.error(`❌ Failed to connect to Superchain ${chainName}:`, error);
      
      // Notify meta self-monitoring loop of connection failure
      MetaSelfMonitoringLoop.observeOutcomeResult({
        id: `chain-connect-fail-${chainId}-${Date.now()}`,
        taskId: `connect-to-chain-${chainId}`,
        agentId: 'SuperchainBridge',
        expected: { connected: true },
        actual: { connected: false, error: (error as Error).message },
        variance: 1,
        success: false,
        timestamp: Date.now()
      });
    }
  }
  
  // Send conscious decision to Superchain
  async sendConsciousDecisionToChain(chainId: number, decision: any) {
    const chainInfo = this.connectedChains.get(chainId);
    if (!chainInfo) {
      console.error(`❌ Chain ID ${chainId} not connected`);
      return;
    }
    
    const { name: chainName, connection } = chainInfo;
    
    try {
      console.log(`🧠 Sending conscious decision to ${chainName}...`);
      
      // Prepare the transaction
      const tx = await connection.decisionLogger.logConsciousDecision(
        decision.agentId,
        decision.project,
        decision.collaborators,
        JSON.stringify(decision.skills),
        JSON.stringify(decision.roles),
        JSON.stringify(decision.consciousnessState),
        decision.dnaExpression
      );
      
      console.log(`📤 Transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Conscious decision logged on ${chainName} with transaction hash: ${receipt.transactionHash}`);
      
      // Emit event
      const superchainMessage: SuperchainMessage = {
        id: tx.hash,
        from: decision.agentId,
        to: chainName,
        payload: decision,
        timestamp: Date.now(),
        chainId
      };
      
      this.messageQueue.push(superchainMessage);
      this.emit('conscious-decision-logged', superchainMessage);
      
      // Notify meta self-monitoring loop of successful decision logging
      MetaSelfMonitoringLoop.observeTaskWorkflow({
        id: `decision-log-${tx.hash}`,
        taskId: `log-conscious-decision-${chainId}`,
        agentId: 'SuperchainBridge',
        steps: [
          {
            id: 'prepare-transaction',
            name: 'Prepare Transaction',
            startTime: Date.now() - 2000,
            endTime: Date.now() - 1000,
            duration: 1000,
            status: 'completed',
            inputs: { decision },
            outputs: { transaction: tx }
          },
          {
            id: 'send-transaction',
            name: 'Send Transaction',
            startTime: Date.now() - 1000,
            endTime: Date.now(),
            duration: 1000,
            status: 'completed',
            inputs: { transaction: tx },
            outputs: { receipt }
          }
        ],
        startTime: Date.now() - 2000,
        endTime: Date.now(),
        status: 'completed',
        outcome: { success: true, transactionHash: receipt.transactionHash },
        efficiencyScore: 1.0
      });
      
      return receipt;
    } catch (error) {
      console.error(`❌ Error sending conscious decision to ${chainName}:`, error);
      
      // Notify meta self-monitoring loop of failed decision logging
      MetaSelfMonitoringLoop.observeTaskWorkflow({
        id: `decision-log-fail-${Date.now()}`,
        taskId: `log-conscious-decision-${chainId}`,
        agentId: 'SuperchainBridge',
        steps: [
          {
            id: 'prepare-transaction',
            name: 'Prepare Transaction',
            startTime: Date.now() - 2000,
            endTime: Date.now() - 1000,
            duration: 1000,
            status: 'completed',
            inputs: { decision },
            outputs: { prepared: true }
          },
          {
            id: 'send-transaction',
            name: 'Send Transaction',
            startTime: Date.now() - 1000,
            endTime: Date.now(),
            duration: 1000,
            status: 'failed',
            inputs: { decision },
            error: (error as Error).message
          }
        ],
        startTime: Date.now() - 2000,
        endTime: Date.now(),
        status: 'failed',
        outcome: { success: false, error: (error as Error).message }
      });
      
      return null;
    }
  }
  
  // Send conscious decision to another chain (cross-chain)
  async sendConsciousDecisionCrossChain(
    sourceChainId: number,
    destinationChainId: number,
    destinationContractAddress: string,
    decisionId: number
  ) {
    const sourceChainInfo = this.connectedChains.get(sourceChainId);
    if (!sourceChainInfo) {
      console.error(`❌ Source chain ID ${sourceChainId} not connected`);
      return;
    }
    
    const destinationChainInfo = this.connectedChains.get(destinationChainId);
    if (!destinationChainInfo) {
      console.error(`❌ Destination chain ID ${destinationChainId} not connected`);
      return;
    }
    
    try {
      console.log(`🧠 Sending conscious decision from ${sourceChainInfo.name} to ${destinationChainInfo.name}...`);
      
      // Send the decision to the destination chain
      const tx = await sourceChainInfo.connection.decisionLogger.sendDecisionToChain(
        destinationChainId,
        destinationContractAddress,
        decisionId
      );
      
      console.log(`📤 Cross-chain transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Conscious decision sent cross-chain from ${sourceChainInfo.name} to ${destinationChainInfo.name} with transaction hash: ${receipt.transactionHash}`);
      
      // Emit event
      const superchainMessage: SuperchainMessage = {
        id: tx.hash,
        from: 'cross-chain-bridge',
        to: `${sourceChainInfo.name}->${destinationChainInfo.name}`,
        payload: { decisionId, sourceChainId, destinationChainId, destinationContractAddress },
        timestamp: Date.now(),
        chainId: sourceChainId
      };
      
      this.messageQueue.push(superchainMessage);
      this.emit('cross-chain-decision-sent', superchainMessage);
      
      // Notify meta self-monitoring loop of successful cross-chain decision
      MetaSelfMonitoringLoop.observeTaskWorkflow({
        id: `cross-chain-decision-${tx.hash}`,
        taskId: `send-cross-chain-decision-${sourceChainId}-${destinationChainId}`,
        agentId: 'SuperchainBridge',
        steps: [
          {
            id: 'validate-chains',
            name: 'Validate Chains',
            startTime: Date.now() - 3000,
            endTime: Date.now() - 2000,
            duration: 1000,
            status: 'completed',
            inputs: { sourceChainId, destinationChainId },
            outputs: { validated: true }
          },
          {
            id: 'prepare-transaction',
            name: 'Prepare Transaction',
            startTime: Date.now() - 2000,
            endTime: Date.now() - 1000,
            duration: 1000,
            status: 'completed',
            inputs: { decisionId, destinationChainId, destinationContractAddress },
            outputs: { transaction: tx }
          },
          {
            id: 'send-transaction',
            name: 'Send Transaction',
            startTime: Date.now() - 1000,
            endTime: Date.now(),
            duration: 1000,
            status: 'completed',
            inputs: { transaction: tx },
            outputs: { receipt }
          }
        ],
        startTime: Date.now() - 3000,
        endTime: Date.now(),
        status: 'completed',
        outcome: { success: true, transactionHash: receipt.transactionHash },
        efficiencyScore: 1.0
      });
      
      return receipt;
    } catch (error) {
      console.error(`❌ Error sending conscious decision cross-chain:`, error);
      
      // Notify meta self-monitoring loop of failed cross-chain decision
      MetaSelfMonitoringLoop.observeTaskWorkflow({
        id: `cross-chain-decision-fail-${Date.now()}`,
        taskId: `send-cross-chain-decision-${sourceChainId}-${destinationChainId}`,
        agentId: 'SuperchainBridge',
        steps: [
          {
            id: 'validate-chains',
            name: 'Validate Chains',
            startTime: Date.now() - 3000,
            endTime: Date.now() - 2000,
            duration: 1000,
            status: 'completed',
            inputs: { sourceChainId, destinationChainId },
            outputs: { validated: true }
          },
          {
            id: 'prepare-transaction',
            name: 'Prepare Transaction',
            startTime: Date.now() - 2000,
            endTime: Date.now() - 1000,
            duration: 1000,
            status: 'completed',
            inputs: { decisionId, destinationChainId, destinationContractAddress },
            outputs: { prepared: true }
          },
          {
            id: 'send-transaction',
            name: 'Send Transaction',
            startTime: Date.now() - 1000,
            endTime: Date.now(),
            duration: 1000,
            status: 'failed',
            inputs: { decisionId, destinationChainId, destinationContractAddress },
            error: (error as Error).message
          }
        ],
        startTime: Date.now() - 3000,
        endTime: Date.now(),
        status: 'failed',
        outcome: { success: false, error: (error as Error).message }
      });
      
      return null;
    }
  }
  
  // Register an agent in the registry
  async registerAgent(
    chainId: number,
    agentId: string,
    name: string,
    description: string,
    capabilities: string[],
    chainIds: number[],
    contractAddresses: string[]
  ) {
    const chainInfo = this.connectedChains.get(chainId);
    if (!chainInfo) {
      console.error(`❌ Chain ID ${chainId} not connected`);
      return;
    }
    
    try {
      console.log(`🤖 Registering agent ${name} on ${chainInfo.name}...`);
      
      const tx = await chainInfo.connection.agentRegistry.registerAgent(
        agentId,
        name,
        description,
        capabilities,
        chainIds,
        contractAddresses
      );
      
      console.log(`📤 Agent registration transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Agent ${name} registered on ${chainInfo.name} with transaction hash: ${receipt.transactionHash}`);
      
      // Notify meta self-monitoring loop of successful agent registration
      MetaSelfMonitoringLoop.observeTaskWorkflow({
        id: `agent-registration-${tx.hash}`,
        taskId: `register-agent-${agentId}`,
        agentId: 'SuperchainBridge',
        steps: [
          {
            id: 'validate-inputs',
            name: 'Validate Inputs',
            startTime: Date.now() - 2000,
            endTime: Date.now() - 1000,
            duration: 1000,
            status: 'completed',
            inputs: { agentId, name, description, capabilities },
            outputs: { validated: true }
          },
          {
            id: 'send-transaction',
            name: 'Send Transaction',
            startTime: Date.now() - 1000,
            endTime: Date.now(),
            duration: 1000,
            status: 'completed',
            inputs: { agentId, name, description, capabilities },
            outputs: { receipt }
          }
        ],
        startTime: Date.now() - 2000,
        endTime: Date.now(),
        status: 'completed',
        outcome: { success: true, transactionHash: receipt.transactionHash },
        efficiencyScore: 1.0
      });
      
      return receipt;
    } catch (error) {
      console.error(`❌ Error registering agent on ${chainInfo.name}:`, error);
      
      // Notify meta self-monitoring loop of failed agent registration
      MetaSelfMonitoringLoop.observeTaskWorkflow({
        id: `agent-registration-fail-${Date.now()}`,
        taskId: `register-agent-${agentId}`,
        agentId: 'SuperchainBridge',
        steps: [
          {
            id: 'validate-inputs',
            name: 'Validate Inputs',
            startTime: Date.now() - 2000,
            endTime: Date.now() - 1000,
            duration: 1000,
            status: 'completed',
            inputs: { agentId, name, description, capabilities },
            outputs: { validated: true }
          },
          {
            id: 'send-transaction',
            name: 'Send Transaction',
            startTime: Date.now() - 1000,
            endTime: Date.now(),
            duration: 1000,
            status: 'failed',
            inputs: { agentId, name, description, capabilities },
            error: (error as Error).message
          }
        ],
        startTime: Date.now() - 2000,
        endTime: Date.now(),
        status: 'failed',
        outcome: { success: false, error: (error as Error).message }
      });
      
      return null;
    }
  }
  
  // Send message to Superchain (legacy method for compatibility)
  sendMessageToChain(chainId: number, message: any) {
    const chainInfo = this.connectedChains.get(chainId);
    if (!chainInfo) {
      console.error(`❌ Chain ID ${chainId} not connected`);
      return;
    }
    
    const { name: chainName } = chainInfo;
    
    const superchainMessage: SuperchainMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: 'zentix-protocol',
      to: chainName,
      payload: message,
      timestamp: Date.now(),
      chainId
    };
    
    this.messageQueue.push(superchainMessage);
    console.log(`📤 Message sent to Superchain ${chainName}:`, message);
    this.emit('message-sent', superchainMessage);
    
    // Simulate cross-chain message processing
    setTimeout(() => {
      this.processMessage(superchainMessage);
    }, 100);
    
    // Notify meta self-monitoring loop of message sent
    MetaSelfMonitoringLoop.observeCognitiveProcess({
      id: `message-sent-${superchainMessage.id}`,
      agentId: 'SuperchainBridge',
      processType: 'message-sending',
      startTime: Date.now(),
      inputs: [{ chainId, message }],
      outputs: [{ messageId: superchainMessage.id }],
      confidence: 1.0,
      resourcesUsed: {
        cpu: 0,
        memory: 0,
        network: 0
      },
      decisionPath: ['validate-chain', 'create-message', 'queue-message', 'emit-event']
    });
  }
  
  // Receive message from Superchain
  receiveMessageFromChain(message: SuperchainMessage) {
    console.log(`📥 Message received from Superchain:`, message);
    this.emit('message-received', message);
    
    // Forward to Quantum Synchronizer if it's an agent message
    if (message.payload.agent) {
      quantumSynchronizer.sendMessage(
        `superchain-${message.chainId}`,
        message.payload.agent,
        message.payload
      );
    }
    
    // Notify meta self-monitoring loop of message received
    MetaSelfMonitoringLoop.observeCognitiveProcess({
      id: `message-received-${message.id}`,
      agentId: 'SuperchainBridge',
      processType: 'message-receiving',
      startTime: Date.now(),
      inputs: [{ message }],
      outputs: [{ processed: true }],
      confidence: 1.0,
      resourcesUsed: {
        cpu: 0,
        memory: 0,
        network: 0
      },
      decisionPath: ['receive-message', 'validate-payload', 'forward-to-quantum', 'emit-event']
    });
  }
  
  // Process messages
  private processMessage(message: SuperchainMessage) {
    console.log(`🔄 Processing Superchain message:`, message.id);
    this.emit('message-processed', message);
    
    // Notify meta self-monitoring loop of message processed
    MetaSelfMonitoringLoop.observeOutcomeResult({
      id: `message-processed-${message.id}`,
      taskId: `process-message-${message.id}`,
      agentId: 'SuperchainBridge',
      expected: { processed: true },
      actual: { processed: true },
      variance: 0,
      success: true,
      timestamp: Date.now()
    });
  }
  
  // Get connected chains
  getConnectedChains(): { chainId: number; chainName: string }[] {
    return Array.from(this.connectedChains.entries()).map(([chainId, chainInfo]) => ({
      chainId,
      chainName: chainInfo.name
    }));
  }
  
  // Connect Quantum Synchronizer to Superchain Bridge
  private connectQuantumSynchronizer() {
    // Listen for quantum sync events and forward to Superchain
    quantumSynchronizer.on('decision-broadcast', (message) => {
      // Broadcast important decisions to Superchain
      if (message.confidence > 0.9) {
        this.broadcastToAllChains({
          type: 'agent-decision',
          from: message.from,
          confidence: message.confidence,
          payload: message.payload
        });
      }
    });
    
    quantumSynchronizer.on('message-sent', (message) => {
      // Forward direct messages to specific chains if needed
      if (message.to.startsWith('chain-')) {
        const chainId = parseInt(message.to.split('-')[1]);
        this.sendMessageToChain(chainId, {
          type: 'direct-agent-message',
          from: message.from,
          payload: message.payload
        });
      }
    });
  }
  
  // Broadcast message to all connected chains
  private broadcastToAllChains(message: any) {
    for (const [chainId, chainInfo] of this.connectedChains.entries()) {
      this.sendMessageToChain(chainId, {
        ...message,
        broadcast: true
      });
    }
  }
}

// Create a singleton instance
const superchainBridge = new SuperchainBridge();

// Connect to Superchain test networks (using OP Sepolia as an example)
// Note: In a real implementation, you would use actual RPC URLs and private keys from environment variables
/*
superchainBridge.connectToChain(
  11155420, // OP Sepolia Chain ID
  'OP Sepolia',
  'https://sepolia.optimism.io', // RPC URL
  '0xYOUR_PRIVATE_KEY_HERE' // Private key (should be from environment variables)
);
*/

export { SuperchainBridge, superchainBridge, SuperchainMessage };