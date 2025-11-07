// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GuardianRewards
 * @dev Reward system for guardian agents who monitor and enforce policies
 * Guardians earn ZXT tokens for detecting violations and maintaining network health
 */
contract GuardianRewards is Ownable {
    IERC20 public token;
    
    // Reward amounts
    uint256 public violationDetectionReward = 20 * 1e18; // 20 ZXT
    uint256 public successfulAuditReward = 10 * 1e18; // 10 ZXT
    uint256 public communityVoteReward = 5 * 1e18; // 5 ZXT
    uint256 public weeklyGuardianBonus = 100 * 1e18; // 100 ZXT
    
    // Guardian tracking
    mapping(address => bool) public isGuardian;
    mapping(address => uint256) public totalEarned;
    mapping(address => uint256) public violationsDetected;
    mapping(address => uint256) public auditsCompleted;
    mapping(address => uint256) public lastBonusClaim;
    
    address[] public guardianList;
    
    // Events
    event GuardianRegistered(address indexed guardian);
    event GuardianRemoved(address indexed guardian);
    event ViolationRewardPaid(address indexed guardian, uint256 amount, string reportId);
    event AuditRewardPaid(address indexed guardian, uint256 amount);
    event VoteRewardPaid(address indexed guardian, uint256 amount, string reportId);
    event WeeklyBonusPaid(address indexed guardian, uint256 amount);
    
    constructor(address _token) {
        token = IERC20(_token);
    }
    
    /**
     * @dev Register a new guardian
     * @param guardian Address of the guardian agent
     */
    function registerGuardian(address guardian) external onlyOwner {
        require(!isGuardian[guardian], "Already a guardian");
        require(guardian != address(0), "Invalid address");
        
        isGuardian[guardian] = true;
        guardianList.push(guardian);
        
        emit GuardianRegistered(guardian);
    }
    
    /**
     * @dev Remove a guardian
     * @param guardian Address of the guardian to remove
     */
    function removeGuardian(address guardian) external onlyOwner {
        require(isGuardian[guardian], "Not a guardian");
        
        isGuardian[guardian] = false;
        
        emit GuardianRemoved(guardian);
    }
    
    /**
     * @dev Reward guardian for detecting a violation
     * @param guardian Address of the guardian
     * @param reportId ID of the violation report
     */
    function rewardViolationDetection(
        address guardian,
        string calldata reportId
    ) external onlyOwner {
        require(isGuardian[guardian], "Not a guardian");
        
        violationsDetected[guardian]++;
        totalEarned[guardian] += violationDetectionReward;
        
        require(
            token.transfer(guardian, violationDetectionReward),
            "Transfer failed"
        );
        
        emit ViolationRewardPaid(guardian, violationDetectionReward, reportId);
    }
    
    /**
     * @dev Reward guardian for completing an audit
     * @param guardian Address of the guardian
     */
    function rewardAudit(address guardian) external onlyOwner {
        require(isGuardian[guardian], "Not a guardian");
        
        auditsCompleted[guardian]++;
        totalEarned[guardian] += successfulAuditReward;
        
        require(
            token.transfer(guardian, successfulAuditReward),
            "Transfer failed"
        );
        
        emit AuditRewardPaid(guardian, successfulAuditReward);
    }
    
    /**
     * @dev Reward guardian for participating in community vote
     * @param guardian Address of the guardian
     * @param reportId ID of the report voted on
     */
    function rewardVote(
        address guardian,
        string calldata reportId
    ) external onlyOwner {
        require(isGuardian[guardian], "Not a guardian");
        
        totalEarned[guardian] += communityVoteReward;
        
        require(
            token.transfer(guardian, communityVoteReward),
            "Transfer failed"
        );
        
        emit VoteRewardPaid(guardian, communityVoteReward, reportId);
    }
    
    /**
     * @dev Claim weekly bonus (guardians can call this)
     */
    function claimWeeklyBonus() external {
        require(isGuardian[msg.sender], "Not a guardian");
        require(
            block.timestamp >= lastBonusClaim[msg.sender] + 7 days,
            "Bonus already claimed this week"
        );
        
        // Require minimum activity (at least 1 violation detected or 5 audits)
        require(
            violationsDetected[msg.sender] > 0 || auditsCompleted[msg.sender] >= 5,
            "Insufficient activity for bonus"
        );
        
        lastBonusClaim[msg.sender] = block.timestamp;
        totalEarned[msg.sender] += weeklyGuardianBonus;
        
        require(
            token.transfer(msg.sender, weeklyGuardianBonus),
            "Transfer failed"
        );
        
        emit WeeklyBonusPaid(msg.sender, weeklyGuardianBonus);
    }
    
    /**
     * @dev Get guardian statistics
     * @param guardian Address of the guardian
     */
    function getGuardianStats(address guardian)
        external
        view
        returns (
            bool isActive,
            uint256 earned,
            uint256 violations,
            uint256 audits,
            uint256 nextBonusTime
        )
    {
        return (
            isGuardian[guardian],
            totalEarned[guardian],
            violationsDetected[guardian],
            auditsCompleted[guardian],
            lastBonusClaim[guardian] + 7 days
        );
    }
    
    /**
     * @dev Get all guardians
     */
    function getAllGuardians() external view returns (address[] memory) {
        return guardianList;
    }
    
    /**
     * @dev Get total number of guardians
     */
    function getGuardianCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < guardianList.length; i++) {
            if (isGuardian[guardianList[i]]) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Update reward amounts (owner only)
     */
    function setRewardAmounts(
        uint256 _violation,
        uint256 _audit,
        uint256 _vote,
        uint256 _weekly
    ) external onlyOwner {
        violationDetectionReward = _violation;
        successfulAuditReward = _audit;
        communityVoteReward = _vote;
        weeklyGuardianBonus = _weekly;
    }
    
    /**
     * @dev Emergency withdrawal (owner only)
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(token.transfer(owner(), amount), "Withdrawal failed");
    }
}
