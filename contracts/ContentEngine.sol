// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./HumanBehaviorDB.sol";

/**
 * @title ContentEngine
 * @dev Attention Marketing Protocol - Generative AI content creation coordinator
 */
contract ContentEngine is Ownable, ReentrancyGuard {
    // Content Intent structure
    struct ContentIntent {
        string intentId;
        string format; // "short_video", "article", "social_post", etc.
        string topic;
        string targetArchetype;
        string tone;
        string[] keyPoints;
        uint256 deadline;
        address requester;
        uint256 timestamp;
    }

    // Generated Content structure
    struct GeneratedContent {
        string contentId;
        string intentId;
        string format;
        string title;
        string content;
        string mediaUrl; // URL to generated media if applicable
        string contentHash; // IPFS hash or other content identifier
        uint256 timestamp;
        bool approved;
    }

    // Storage mappings
    mapping(string => ContentIntent) public contentIntents;
    mapping(string => GeneratedContent) public generatedContents;
    mapping(address => string[]) public userContentHistory;
    mapping(string => string[]) public archetypeContentMapping;
    
    // Events
    event ContentIntentCreated(string indexed intentId, address requester, string format, string topic);
    event ContentGenerated(string indexed contentId, string intentId, string format, string contentHash);
    event ContentApproved(string indexed contentId, address approver);
    event ContentRejected(string indexed contentId, address rejecter, string reason);

    // References to other contracts
    HumanBehaviorDB public humanBehaviorDB;

    // Modifiers
    modifier onlyRegisteredAIZ() {
        // In a full implementation, this would check against the AIZ registry
        _;
    }

    constructor(address _humanBehaviorDBAddress) {
        humanBehaviorDB = HumanBehaviorDB(_humanBehaviorDBAddress);
    }

    /**
     * @dev Create a content intent for generative AI
     * @param _format Content format
     * @param _topic Content topic
     * @param _targetArchetype Target behavioral archetype
     * @param _tone Content tone
     * @param _keyPoints Key points to include
     * @param _deadline Deadline for completion
     */
    function createContentIntent(
        string memory _format,
        string memory _topic,
        string memory _targetArchetype,
        string memory _tone,
        string[] memory _keyPoints,
        uint256 _deadline
    ) external onlyRegisteredAIZ nonReentrant {
        string memory intentId = string(abi.encodePacked(
            "intent_", 
            Strings.toString(block.timestamp), 
            "_", 
            Strings.toString(uint256(uint160(msg.sender)))
        ));
        
        ContentIntent storage intent = contentIntents[intentId];
        intent.intentId = intentId;
        intent.format = _format;
        intent.topic = _topic;
        intent.targetArchetype = _targetArchetype;
        intent.tone = _tone;
        intent.keyPoints = _keyPoints;
        intent.deadline = _deadline;
        intent.requester = msg.sender;
        intent.timestamp = block.timestamp;
        
        userContentHistory[msg.sender].push(intentId);
        
        emit ContentIntentCreated(intentId, msg.sender, _format, _topic);
    }

    /**
     * @dev Record generated content from off-chain AI
     * @param _intentId The intent this content fulfills
     * @param _title Content title
     * @param _content Generated content
     * @param _mediaUrl URL to generated media
     * @param _contentHash Hash of the content for verification
     */
    function recordGeneratedContent(
        string memory _intentId,
        string memory _title,
        string memory _content,
        string memory _mediaUrl,
        string memory _contentHash
    ) external onlyOwner nonReentrant {
        ContentIntent storage intent = contentIntents[_intentId];
        require(bytes(intent.intentId).length > 0, "Intent does not exist");
        require(intent.deadline > block.timestamp, "Intent deadline has passed");
        
        string memory contentId = string(abi.encodePacked(
            "content_", 
            Strings.toString(block.timestamp), 
            "_", 
            Strings.toString(uint256(uint160(msg.sender)))
        ));
        
        GeneratedContent storage content = generatedContents[contentId];
        content.contentId = contentId;
        content.intentId = _intentId;
        content.format = intent.format;
        content.title = _title;
        content.content = _content;
        content.mediaUrl = _mediaUrl;
        content.contentHash = _contentHash;
        content.timestamp = block.timestamp;
        content.approved = false;
        
        // Map content to archetype
        archetypeContentMapping[intent.targetArchetype].push(contentId);
        
        emit ContentGenerated(contentId, _intentId, intent.format, _contentHash);
    }

    /**
     * @dev Approve generated content
     * @param _contentId Content to approve
     */
    function approveContent(string memory _contentId) external onlyOwner nonReentrant {
        GeneratedContent storage content = generatedContents[_contentId];
        require(bytes(content.contentId).length > 0, "Content does not exist");
        require(!content.approved, "Content already approved");
        
        content.approved = true;
        
        emit ContentApproved(_contentId, msg.sender);
    }

    /**
     * @dev Reject generated content
     * @param _contentId Content to reject
     * @param _reason Reason for rejection
     */
    function rejectContent(string memory _contentId, string memory _reason) external onlyOwner nonReentrant {
        GeneratedContent storage content = generatedContents[_contentId];
        require(bytes(content.contentId).length > 0, "Content does not exist");
        require(!content.approved, "Content already approved");
        
        // In a full implementation, this would trigger regeneration
        emit ContentRejected(_contentId, msg.sender, _reason);
    }

    /**
     * @dev Get content intent
     * @param _intentId Intent to retrieve
     * @return ContentIntent struct
     */
    function getContentIntent(string memory _intentId) 
        external 
        view 
        returns (ContentIntent memory) 
    {
        return contentIntents[_intentId];
    }

    /**
     * @dev Get generated content
     * @param _contentId Content to retrieve
     * @return GeneratedContent struct
     */
    function getGeneratedContent(string memory _contentId) 
        external 
        view 
        returns (GeneratedContent memory) 
    {
        return generatedContents[_contentId];
    }

    /**
     * @dev Get user's content history
     * @param _user User address
     * @param _limit Maximum number of results
     * @return Array of intent IDs
     */
    function getUserContentHistory(address _user, uint256 _limit) 
        external 
        view 
        returns (string[] memory) 
    {
        string[] storage history = userContentHistory[_user];
        uint256 length = history.length < _limit ? history.length : _limit;
        
        string[] memory recentHistory = new string[](length);
        for (uint256 i = 0; i < length; i++) {
            recentHistory[i] = history[history.length - 1 - i];
        }
        
        return recentHistory;
    }

    /**
     * @dev Get content for a specific archetype
     * @param _archetypeId Archetype ID
     * @param _limit Maximum number of results
     * @return Array of content IDs
     */
    function getArchetypeContent(string memory _archetypeId, uint256 _limit) 
        external 
        view 
        returns (string[] memory) 
    {
        string[] storage contentList = archetypeContentMapping[_archetypeId];
        uint256 length = contentList.length < _limit ? contentList.length : _limit;
        
        string[] memory recentContent = new string[](length);
        for (uint256 i = 0; i < length; i++) {
            recentContent[i] = contentList[contentList.length - 1 - i];
        }
        
        return recentContent;
    }

    /**
     * @dev Utility library for string operations
     */
    library Strings {
        function toString(uint256 value) internal pure returns (string memory) {
            if (value == 0) {
                return "0";
            }
            uint256 temp = value;
            uint256 digits;
            while (temp != 0) {
                digits++;
                temp /= 10;
            }
            bytes memory buffer = new bytes(digits);
            while (value != 0) {
                digits -= 1;
                buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
                value /= 10;
            }
            return string(buffer);
        }
    }
}