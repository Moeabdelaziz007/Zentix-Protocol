// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AIZRegistry.sol";

/**
 * @title ReputationStaking
 * @dev Contract for staking reputation on AIZ actions and creating tradable reputation bonds
 */
contract ReputationStaking is ERC1155, Ownable {
    struct ReputationStake {
        bytes32 aizId;
        address staker;
        uint256 amount;
        bytes action;
        uint256 stakedAt;
        uint256 resolvedAt;
        bool isActive;
        bool isResolved;
    }

    struct ReputationBond {
        uint256 bondId;
        bytes32 aizId;
        uint256 reputationAmount;
        bytes action;
        address issuer;
        uint256 issuedAt;
        bool isActive;
    }

    mapping(uint256 => ReputationStake) public reputationStakes;
    mapping(uint256 => ReputationBond) public reputationBonds;
    mapping(bytes32 => uint256[]) public aizStakes;
    mapping(address => uint256[]) public stakerStakes;
    mapping(uint256 => address[]) public bondHolders;
    
    uint256 public stakeCount;
    uint256 public bondCount;
    address public aizRegistryAddress;

    event ReputationStaked(
        uint256 indexed stakeId,
        bytes32 indexed aizId,
        address indexed staker,
        uint256 amount,
        bytes action
    );
    
    event ReputationUnstaked(
        uint256 indexed stakeId,
        uint256 amount,
        bool success
    );
    
    event ReputationBondIssued(
        uint256 indexed bondId,
        bytes32 indexed aizId,
        uint256 reputationAmount,
        address issuer
    );
    
    event ReputationBondTraded(
        uint256 indexed bondId,
        address indexed from,
        address indexed to,
        uint256 amount
    );

    constructor(address _aizRegistryAddress) ERC1155("https://zentix.ai/api/reputation-bond/{id}.json") {
        aizRegistryAddress = _aizRegistryAddress;
    }

    /**
     * @dev Stake reputation on an AIZ action
     * @param _aizId The ID of the AIZ
     * @param _amount The amount of reputation to stake
     * @param _action The action being staked on
     * @return uint256 The ID of the created stake
     */
    function stake(
        bytes32 _aizId,
        uint256 _amount,
        bytes calldata _action
    ) external returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(AIZRegistry(aizRegistryAddress).getAIZ(_aizId).registrationTimestamp > 0, 
            "AIZ not registered");

        stakeCount++;
        
        reputationStakes[stakeCount] = ReputationStake({
            aizId: _aizId,
            staker: msg.sender,
            amount: _amount,
            action: _action,
            stakedAt: block.timestamp,
            resolvedAt: 0,
            isActive: true,
            isResolved: false
        });

        aizStakes[_aizId].push(stakeCount);
        stakerStakes[msg.sender].push(stakeCount);

        emit ReputationStaked(stakeCount, _aizId, msg.sender, _amount, _action);

        return stakeCount;
    }

    /**
     * @dev Resolve a reputation stake (success or failure)
     * @param _stakeId The ID of the stake to resolve
     * @param _success Whether the action was successful
     * @param _rewardMultiplier The reward multiplier for successful actions (1.0 = 100%)
     */
    function resolveStake(
        uint256 _stakeId,
        bool _success,
        uint256 _rewardMultiplier
    ) external onlyOwner {
        ReputationStake storage stake = reputationStakes[_stakeId];
        require(stake.isActive, "Stake not active");
        require(!stake.isResolved, "Stake already resolved");

        stake.isResolved = true;
        stake.resolvedAt = block.timestamp;
        stake.isActive = false;

        // Issue reputation bond if successful
        if (_success) {
            bondCount++;
            
            reputationBonds[bondCount] = ReputationBond({
                bondId: bondCount,
                aizId: stake.aizId,
                reputationAmount: (stake.amount * _rewardMultiplier) / 100,
                action: stake.action,
                issuer: stake.staker,
                issuedAt: block.timestamp,
                isActive: true
            });

            // Mint ERC1155 token for the reputation bond
            _mint(stake.staker, bondCount, 1, "");

            emit ReputationBondIssued(bondCount, stake.aizId, (stake.amount * _rewardMultiplier) / 100, stake.staker);
            emit ReputationUnstaked(_stakeId, stake.amount, true);
        } else {
            // For failed stakes, reputation is burned (no token minting)
            emit ReputationUnstaked(_stakeId, stake.amount, false);
        }
    }

    /**
     * @dev Trade reputation bonds
     * @param _from The address to transfer from
     * @param _to The address to transfer to
     * @param _bondId The ID of the bond to transfer
     * @param _amount The amount to transfer
     * @param _data Additional data
     */
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _bondId,
        uint256 _amount,
        bytes memory _data
    ) public override {
        require(_from == msg.sender || isApprovedForAll(_from, msg.sender), "Not authorized to transfer");
        require(reputationBonds[_bondId].isActive, "Bond not active");

        super.safeTransferFrom(_from, _to, _bondId, _amount, _data);
        
        // Update bond holders
        if (balanceOf(_from, _bondId) == 0) {
            // Remove from _from's bond holdings
            for (uint256 i = 0; i < bondHolders[_bondId].length; i++) {
                if (bondHolders[_bondId][i] == _from) {
                    bondHolders[_bondId][i] = bondHolders[_bondId][bondHolders[_bondId].length - 1];
                    bondHolders[_bondId].pop();
                    break;
                }
            }
        }
        
        // Add to _to's bond holdings if not already there
        bool found = false;
        for (uint256 i = 0; i < bondHolders[_bondId].length; i++) {
            if (bondHolders[_bondId][i] == _to) {
                found = true;
                break;
            }
        }
        if (!found) {
            bondHolders[_bondId].push(_to);
        }

        emit ReputationBondTraded(_bondId, _from, _to, _amount);
    }

    /**
     * @dev Get all stakes for an AIZ
     * @param _aizId The AIZ ID
     * @return Array of stake IDs
     */
    function getStakesForAIZ(bytes32 _aizId) external view returns (uint256[] memory) {
        return aizStakes[_aizId];
    }

    /**
     * @dev Get all stakes for a staker
     * @param _staker The staker address
     * @return Array of stake IDs
     */
    function getStakesForStaker(address _staker) external view returns (uint256[] memory) {
        return stakerStakes[_staker];
    }

    /**
     * @dev Get reputation stake by ID
     * @param _stakeId The stake ID
     * @return ReputationStake struct
     */
    function getReputationStake(uint256 _stakeId) external view returns (ReputationStake memory) {
        return reputationStakes[_stakeId];
    }

    /**
     * @dev Get reputation bond by ID
     * @param _bondId The bond ID
     * @return ReputationBond struct
     */
    function getReputationBond(uint256 _bondId) external view returns (ReputationBond memory) {
        return reputationBonds[_bondId];
    }

    /**
     * @dev Get bond holders
     * @param _bondId The bond ID
     * @return Array of holder addresses
     */
    function getBondHolders(uint256 _bondId) external view returns (address[] memory) {
        return bondHolders[_bondId];
    }

    /**
     * @dev Check if a bond is active
     * @param _bondId The bond ID
     * @return Whether the bond is active
     */
    function isBondActive(uint256 _bondId) external view returns (bool) {
        return reputationBonds[_bondId].isActive;
    }
}