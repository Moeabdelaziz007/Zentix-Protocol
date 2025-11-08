// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CompetitorRegistry
 * @dev Registry for competitor contracts to enable monitoring and threat analysis
 */
contract CompetitorRegistry is Ownable {
    struct Competitor {
        address contractAddress;
        string name;
        string category; // DEX, Lending, Yield Aggregator, etc.
        uint256 registeredAt;
        bool isActive;
    }

    mapping(address => Competitor) public competitors;
    mapping(string => address[]) public categoryToCompetitors;
    address[] public competitorAddresses;
    
    uint256 public competitorCount;

    event CompetitorRegistered(address indexed competitorAddress, string name, string category);
    event CompetitorUpdated(address indexed competitorAddress, string name, string category);
    event CompetitorDeactivated(address indexed competitorAddress);
    event CompetitorReactivated(address indexed competitorAddress);

    /**
     * @dev Register a new competitor
     * @param _contractAddress The address of the competitor's contract
     * @param _name The name of the competitor
     * @param _category The category of the competitor (DEX, Lending, etc.)
     */
    function registerCompetitor(
        address _contractAddress,
        string memory _name,
        string memory _category
    ) external onlyOwner {
        require(_contractAddress != address(0), "Invalid address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_category).length > 0, "Category cannot be empty");
        require(!competitors[_contractAddress].isActive, "Competitor already registered");

        competitors[_contractAddress] = Competitor({
            contractAddress: _contractAddress,
            name: _name,
            category: _category,
            registeredAt: block.timestamp,
            isActive: true
        });

        categoryToCompetitors[_category].push(_contractAddress);
        competitorAddresses.push(_contractAddress);
        competitorCount++;

        emit CompetitorRegistered(_contractAddress, _name, _category);
    }

    /**
     * @dev Update competitor information
     * @param _contractAddress The address of the competitor's contract
     * @param _name The updated name of the competitor
     * @param _category The updated category of the competitor
     */
    function updateCompetitor(
        address _contractAddress,
        string memory _name,
        string memory _category
    ) external onlyOwner {
        require(competitors[_contractAddress].isActive, "Competitor not registered");
        
        Competitor storage competitor = competitors[_contractAddress];
        competitor.name = _name;
        competitor.category = _category;

        emit CompetitorUpdated(_contractAddress, _name, _category);
    }

    /**
     * @dev Deactivate a competitor
     * @param _contractAddress The address of the competitor's contract
     */
    function deactivateCompetitor(address _contractAddress) external onlyOwner {
        require(competitors[_contractAddress].isActive, "Competitor not registered");
        
        competitors[_contractAddress].isActive = false;
        competitorCount--;

        emit CompetitorDeactivated(_contractAddress);
    }

    /**
     * @dev Reactivate a competitor
     * @param _contractAddress The address of the competitor's contract
     */
    function reactivateCompetitor(address _contractAddress) external onlyOwner {
        require(!competitors[_contractAddress].isActive, "Competitor already active");
        
        competitors[_contractAddress].isActive = true;
        competitorCount++;

        emit CompetitorReactivated(_contractAddress);
    }

    /**
     * @dev Get all competitors in a category
     * @param _category The category to query
     * @return Array of competitor addresses
     */
    function getCompetitorsByCategory(string memory _category) external view returns (address[] memory) {
        return categoryToCompetitors[_category];
    }

    /**
     * @dev Get all competitor addresses
     * @return Array of all competitor addresses
     */
    function getAllCompetitorAddresses() external view returns (address[] memory) {
        return competitorAddresses;
    }

    /**
     * @dev Check if an address is a registered competitor
     * @param _contractAddress The address to check
     * @return Whether the address is a registered competitor
     */
    function isRegisteredCompetitor(address _contractAddress) external view returns (bool) {
        return competitors[_contractAddress].isActive;
    }
}