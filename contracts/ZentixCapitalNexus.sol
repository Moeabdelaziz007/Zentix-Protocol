// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IZentixCapitalNexus.sol";
import "./AIZRegistry.sol";
import "./IntentBus.sol";

/**
 * @title ZentixCapitalNexus
 * @dev Implementation of the Zentix Capital Nexus
 * Enables agent financing and value creation through a protocol-level treasury
 */
contract ZentixCapitalNexus is IZentixCapitalNexus, Ownable {
    // Reference to the AIZ Registry
    AIZRegistry public aizRegistry;
    
    // Reference to the Intent Bus
    IntentBus public intentBus;
    
    // Treasury token (using a generic ERC20 for this example)
    IERC20 public treasuryToken;
    
    // Treasury balance
    uint256 public treasuryBalance;
    
    // Loan structure
    struct Loan {
        uint256 loanId;
        address borrower;
        uint256 amount;
        uint256 interestRate; // Basis points (e.g., 100 = 1%)
        uint256 startTime;
        uint256 endTime;
        string purpose;
        bool repaid;
    }
    
    // Mapping of loan IDs to loans
    mapping(uint256 => Loan) public loans;
    
    // Mapping of agents to their credit scores
    mapping(address => uint256) public creditScores;
    
    // Loan counter
    uint256 public loanCounter;
    
    // Events
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        string purpose,
        uint256 timestamp
    );
    
    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 timestamp
    );
    
    event RewardsDeposited(
        address indexed depositor,
        uint256 amount,
        uint256 timestamp
    );
    
    event CreditScoreUpdated(
        address indexed agent,
        uint256 score,
        uint256 timestamp
    );
    
    constructor(address _aizRegistry, address _intentBus, address _treasuryToken) {
        aizRegistry = AIZRegistry(_aizRegistry);
        intentBus = IntentBus(_intentBus);
        treasuryToken = IERC20(_treasuryToken);
    }
    
    /**
     * @dev Request capital for specific tasks
     * @param amount Amount to borrow
     * @param purpose Purpose of the loan
     * @return Loan ID
     */
    function borrow(uint256 amount, string calldata purpose) external returns (uint256) {
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // Check if there's enough in the treasury
        require(treasuryBalance >= amount, "Insufficient treasury balance");
        
        // Calculate interest rate based on credit score
        uint256 creditScore = creditScores[msg.sender];
        uint256 interestRate = calculateInterestRate(creditScore);
        
        // Create loan
        loanCounter++;
        uint256 loanId = loanCounter;
        
        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            amount: amount,
            interestRate: interestRate,
            startTime: block.timestamp,
            endTime: block.timestamp + 30 days, // 30 day loan term
            purpose: purpose,
            repaid: false
        });
        
        // Transfer funds to borrower
        treasuryBalance -= amount;
        require(treasuryToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit LoanCreated(loanId, msg.sender, amount, purpose, block.timestamp);
        
        return loanId;
    }
    
    /**
     * @dev Repay borrowed capital plus interest
     * @param loanId ID of the loan to repay
     */
    function repay(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        require(loan.loanId != 0, "Loan does not exist");
        require(loan.borrower == msg.sender, "Not the borrower");
        require(!loan.repaid, "Loan already repaid");
        
        // Calculate amount due (principal + interest)
        uint256 interest = (loan.amount * loan.interestRate) / 10000; // Interest rate in basis points
        uint256 amountDue = loan.amount + interest;
        
        // Transfer funds from borrower to treasury
        require(treasuryToken.transferFrom(msg.sender, address(this), amountDue), "Transfer failed");
        treasuryBalance += amountDue;
        
        // Mark loan as repaid
        loan.repaid = true;
        
        // Improve borrower's credit score
        updateCreditScore(msg.sender, creditScores[msg.sender] + 10);
        
        emit LoanRepaid(loanId, msg.sender, amountDue, block.timestamp);
    }
    
    /**
     * @dev Get agent's creditworthiness score
     * @param agent Address of the agent
     * @return Credit score
     */
    function getCreditScore(address agent) external view returns (uint256) {
        return creditScores[agent];
    }
    
    /**
     * @dev Deposit MEV or other rewards to treasury
     * @param amount Amount to deposit
     */
    function depositRewards(uint256 amount) external {
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // Transfer funds to treasury
        require(treasuryToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        treasuryBalance += amount;
        
        emit RewardsDeposited(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Calculate interest rate based on credit score
     * @param creditScore Agent's credit score
     * @return Interest rate in basis points
     */
    function calculateInterestRate(uint256 creditScore) internal pure returns (uint256) {
        if (creditScore >= 800) {
            return 50; // 0.5%
        } else if (creditScore >= 700) {
            return 100; // 1%
        } else if (creditScore >= 600) {
            return 200; // 2%
        } else if (creditScore >= 500) {
            return 500; // 5%
        } else {
            return 1000; // 10%
        }
    }
    
    /**
     * @dev Update an agent's credit score
     * @param agent Address of the agent
     * @param score New credit score
     */
    function updateCreditScore(address agent, uint256 score) internal {
        // Cap credit score at 1000
        if (score > 1000) {
            score = 1000;
        }
        
        creditScores[agent] = score;
        
        emit CreditScoreUpdated(agent, score, block.timestamp);
    }
    
    /**
     * @dev Set treasury token (only owner)
     * @param _treasuryToken Address of the treasury token
     */
    function setTreasuryToken(address _treasuryToken) external onlyOwner {
        treasuryToken = IERC20(_treasuryToken);
    }
    
    /**
     * @dev Initialize an agent's credit score (only owner)
     * @param agent Address of the agent
     * @param score Initial credit score
     */
    function initializeCreditScore(address agent, uint256 score) external onlyOwner {
        creditScores[agent] = score;
        
        emit CreditScoreUpdated(agent, score, block.timestamp);
    }
}