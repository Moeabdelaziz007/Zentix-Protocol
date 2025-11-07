// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReferralReward
 * @dev Referral and rewards system for Zentix agents
 * Distributes ZXT tokens for referrals, task completion, and community growth
 */
contract ReferralReward is Ownable {
    IERC20 public token;
    
    // Reward amounts
    uint256 public referralReward = 10 * 1e18; // 10 ZXT
    uint256 public taskCompletionReward = 5 * 1e18; // 5 ZXT
    uint256 public firstAgentBonus = 50 * 1e18; // 50 ZXT
    
    // Referral tracking
    mapping(address => address) public referrer;
    mapping(address => uint256) public referralCount;
    mapping(address => bool) public hasCreatedAgent;
    mapping(address => uint256) public totalEarned;
    
    // Anti-abuse mechanisms
    mapping(address => uint256) public lastFaucetClaim;
    uint256 public faucetCooldown = 24 hours;
    uint256 public faucetAmount = 10 * 1e18; // 10 ZXT
    
    event ReferralRegistered(address indexed user, address indexed referrer);
    event ReferralRewarded(address indexed referrer, address indexed user, uint256 amount);
    event TaskRewardPaid(address indexed user, uint256 amount);
    event FirstAgentBonusPaid(address indexed user, uint256 amount);
    event FaucetClaimed(address indexed user, uint256 amount);
    
    constructor(address _token) {
        token = IERC20(_token);
    }
    
    /**
     * @dev Register a referral relationship
     * @param ref Address of the referrer
     */
    function registerReferral(address ref) external {
        require(referrer[msg.sender] == address(0), "Already has referrer");
        require(ref != address(0), "Invalid referrer");
        require(ref != msg.sender, "Cannot refer yourself");
        
        referrer[msg.sender] = ref;
        referralCount[ref]++;
        
        emit ReferralRegistered(msg.sender, ref);
        
        // Reward the referrer
        _rewardReferrer(msg.sender);
    }
    
    /**
     * @dev Reward referrer when user takes action
     * @param user The user who was referred
     */
    function _rewardReferrer(address user) internal {
        address ref = referrer[user];
        if (ref != address(0)) {
            totalEarned[ref] += referralReward;
            require(
                token.transfer(ref, referralReward),
                "Referral reward failed"
            );
            emit ReferralRewarded(ref, user, referralReward);
        }
    }
    
    /**
     * @dev Reward user for completing a task
     * @param user Address to reward
     */
    function rewardTaskCompletion(address user) external onlyOwner {
        require(user != address(0), "Invalid user");
        
        totalEarned[user] += taskCompletionReward;
        require(
            token.transfer(user, taskCompletionReward),
            "Task reward failed"
        );
        
        emit TaskRewardPaid(user, taskCompletionReward);
    }
    
    /**
     * @dev Bonus for creating first agent
     * @param user Address to reward
     */
    function rewardFirstAgent(address user) external onlyOwner {
        require(!hasCreatedAgent[user], "Already claimed");
        require(user != address(0), "Invalid user");
        
        hasCreatedAgent[user] = true;
        totalEarned[user] += firstAgentBonus;
        
        require(
            token.transfer(user, firstAgentBonus),
            "First agent bonus failed"
        );
        
        emit FirstAgentBonusPaid(user, firstAgentBonus);
        
        // Also reward their referrer if they have one
        _rewardReferrer(user);
    }
    
    /**
     * @dev Faucet - claim free tokens (rate limited)
     */
    function claimFaucet() external {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + faucetCooldown,
            "Faucet on cooldown"
        );
        
        lastFaucetClaim[msg.sender] = block.timestamp;
        totalEarned[msg.sender] += faucetAmount;
        
        require(token.transfer(msg.sender, faucetAmount), "Faucet failed");
        
        emit FaucetClaimed(msg.sender, faucetAmount);
    }
    
    /**
     * @dev Update reward amounts (owner only)
     */
    function setRewardAmounts(
        uint256 _referral,
        uint256 _task,
        uint256 _firstAgent,
        uint256 _faucet
    ) external onlyOwner {
        referralReward = _referral;
        taskCompletionReward = _task;
        firstAgentBonus = _firstAgent;
        faucetAmount = _faucet;
    }
    
    /**
     * @dev Update faucet cooldown (owner only)
     */
    function setFaucetCooldown(uint256 _cooldown) external onlyOwner {
        faucetCooldown = _cooldown;
    }
    
    /**
     * @dev Get referral stats for user
     */
    function getReferralStats(address user)
        external
        view
        returns (
            address referrerAddress,
            uint256 referrals,
            uint256 earned
        )
    {
        return (referrer[user], referralCount[user], totalEarned[user]);
    }
    
    /**
     * @dev Check if user can claim faucet
     */
    function canClaimFaucet(address user) external view returns (bool) {
        return block.timestamp >= lastFaucetClaim[user] + faucetCooldown;
    }
    
    /**
     * @dev Emergency withdrawal (owner only)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(token.transfer(owner(), amount), "Withdrawal failed");
    }
}
