// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title HumanBehaviorDB
 * @dev Attention Marketing Protocol - Shared knowledge base for behavioral archetypes
 */
contract HumanBehaviorDB is Ownable, ReentrancyGuard {
    // Behavioral Archetype structure
    struct BehavioralArchetype {
        string name;
        string description;
        mapping(string => uint256) traits; // trait name => value (0-100)
        uint256 lastUpdated;
        uint256 confidenceScore; // How confident we are in this archetype (0-100)
    }

    // Content Performance structure
    struct ContentPerformance {
        string contentId;
        string archetypeId;
        uint256 views;
        uint256 likes;
        uint256 shares;
        uint256 conversions;
        uint256 timestamp;
    }

    // Storage mappings
    mapping(string => BehavioralArchetype) public archetypes;
    mapping(string => ContentPerformance) public contentPerformances;
    mapping(string => string[]) public archetypeContentHistory;
    
    // Events
    event ArchetypeUpdated(string indexed archetypeId, string name, uint256 confidenceScore);
    event ContentPerformanceRecorded(string indexed contentId, string archetypeId, uint256 timestamp);
    event ArchetypeCreated(string indexed archetypeId, string name);

    // Modifiers
    modifier onlyRegisteredAIZ() {
        // In a full implementation, this would check against the AIZ registry
        _;
    }

    /**
     * @dev Create a new behavioral archetype
     * @param _archetypeId Unique identifier for the archetype
     * @param _name Human-readable name
     * @param _description Description of the archetype
     */
    function createArchetype(
        string memory _archetypeId,
        string memory _name,
        string memory _description
    ) external onlyOwner {
        BehavioralArchetype storage archetype = archetypes[_archetypeId];
        archetype.name = _name;
        archetype.description = _description;
        archetype.lastUpdated = block.timestamp;
        archetype.confidenceScore = 50; // Start with medium confidence
        
        emit ArchetypeCreated(_archetypeId, _name);
    }

    /**
     * @dev Update behavioral traits for an archetype
     * @param _archetypeId The archetype to update
     * @param _traitNames Array of trait names
     * @param _traitValues Array of trait values (0-100)
     */
    function updateArchetypeTraits(
        string memory _archetypeId,
        string[] memory _traitNames,
        uint256[] memory _traitValues
    ) external onlyRegisteredAIZ nonReentrant {
        BehavioralArchetype storage archetype = archetypes[_archetypeId];
        require(bytes(archetype.name).length > 0, "Archetype does not exist");
        
        for (uint256 i = 0; i < _traitNames.length; i++) {
            require(_traitValues[i] <= 100, "Trait value must be 0-100");
            archetype.traits[_traitNames[i]] = _traitValues[i];
        }
        
        archetype.lastUpdated = block.timestamp;
        
        // Update confidence based on number of updates
        if (archetype.confidenceScore < 90) {
            archetype.confidenceScore += 1;
        }
        
        emit ArchetypeUpdated(_archetypeId, archetype.name, archetype.confidenceScore);
    }

    /**
     * @dev Record content performance for an archetype
     * @param _contentId Unique content identifier
     * @param _archetypeId Target archetype
     * @param _views View count
     * @param _likes Like count
     * @param _shares Share count
     * @param _conversions Conversion count
     */
    function recordContentPerformance(
        string memory _contentId,
        string memory _archetypeId,
        uint256 _views,
        uint256 _likes,
        uint256 _shares,
        uint256 _conversions
    ) external onlyRegisteredAIZ nonReentrant {
        ContentPerformance storage performance = contentPerformances[_contentId];
        performance.contentId = _contentId;
        performance.archetypeId = _archetypeId;
        performance.views = _views;
        performance.likes = _likes;
        performance.shares = _shares;
        performance.conversions = _conversions;
        performance.timestamp = block.timestamp;
        
        archetypeContentHistory[_archetypeId].push(_contentId);
        
        emit ContentPerformanceRecorded(_contentId, _archetypeId, block.timestamp);
    }

    /**
     * @dev Get behavioral traits for an archetype
     * @param _archetypeId The archetype to query
     * @param _traitNames Array of trait names to retrieve
     * @return Array of trait values
     */
    function getArchetypeTraits(
        string memory _archetypeId,
        string[] memory _traitNames
    ) external view returns (uint256[] memory) {
        BehavioralArchetype storage archetype = archetypes[_archetypeId];
        require(bytes(archetype.name).length > 0, "Archetype does not exist");
        
        uint256[] memory traits = new uint256[](_traitNames.length);
        for (uint256 i = 0; i < _traitNames.length; i++) {
            traits[i] = archetype.traits[_traitNames[i]];
        }
        
        return traits;
    }

    /**
     * @dev Get archetype information
     * @param _archetypeId The archetype to query
     * @return name, description, lastUpdated, confidenceScore
     */
    function getArchetypeInfo(string memory _archetypeId) 
        external 
        view 
        returns (
            string memory name,
            string memory description,
            uint256 lastUpdated,
            uint256 confidenceScore
        ) 
    {
        BehavioralArchetype storage archetype = archetypes[_archetypeId];
        require(bytes(archetype.name).length > 0, "Archetype does not exist");
        
        return (
            archetype.name,
            archetype.description,
            archetype.lastUpdated,
            archetype.confidenceScore
        );
    }

    /**
     * @dev Get content performance
     * @param _contentId The content to query
     * @return ContentPerformance struct
     */
    function getContentPerformance(string memory _contentId) 
        external 
        view 
        returns (ContentPerformance memory) 
    {
        return contentPerformances[_contentId];
    }

    /**
     * @dev Get top performing content for an archetype
     * @param _archetypeId The archetype to query
     * @param _limit Maximum number of results
     * @return Array of content IDs
     */
    function getTopPerformingContent(
        string memory _archetypeId,
        uint256 _limit
    ) external view returns (string[] memory) {
        string[] storage history = archetypeContentHistory[_archetypeId];
        uint256 length = history.length < _limit ? history.length : _limit;
        
        string[] memory topContent = new string[](length);
        for (uint256 i = 0; i < length; i++) {
            topContent[i] = history[history.length - 1 - i];
        }
        
        return topContent;
    }
}