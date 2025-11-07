// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZXTToken
 * @dev Zentix Token (ZXT) - ERC20 token for the Zentix agent economy
 * Agents earn, spend, and transfer ZXT tokens for tasks and services
 */
contract ZXTToken is ERC20, Ownable {
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event AgentRewarded(address indexed agent, uint256 amount, string task);

    constructor(uint256 initialSupply) ERC20("Zentix Token", "ZXT") {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Mint new tokens (owner only)
     * @param to Address to receive tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount, "Manual mint");
    }

    /**
     * @dev Reward an agent for task completion
     * @param agent Agent wallet address
     * @param amount Reward amount
     * @param task Task identifier
     */
    function rewardAgent(
        address agent,
        uint256 amount,
        string calldata task
    ) external onlyOwner {
        _mint(agent, amount);
        emit AgentRewarded(agent, amount, task);
    }

    /**
     * @dev Burn tokens from sender
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
