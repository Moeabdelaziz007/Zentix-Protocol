// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ContentEngine.sol";

/**
 * @title EngagementTracker
 * @dev Attention Marketing Protocol - Oracle-based engagement metrics tracker
 */
contract EngagementTracker is Ownable, ReentrancyGuard {
    // Engagement Metrics structure
    struct EngagementMetrics {
        string contentId;
        string platform;
        uint256 views;
        uint256 likes;
        uint256 shares;
        uint256 comments;
        uint256 conversions;
        uint256 reach;
        uint256 timestamp;
        bool verified;
    }

    // Platform configuration
    struct PlatformConfig {
        string name;
        bool active;
        uint256 weight; // Weight for scoring calculations (0-100)
    }

    // Aggregated metrics for content
    struct AggregatedMetrics {
        string contentId;
        uint256 totalViews;
        uint256 totalLikes;
        uint256 totalShares;
        uint256 totalComments;
        uint256 totalConversions;
        uint256 totalReach;
        uint256 averageEngagementRate;
        uint256 lastUpdated;
    }

    // Storage mappings
    mapping(string => EngagementMetrics) public engagementMetrics;
    mapping(string => mapping(string => bool)) public processedMetrics; // contentId => platform => processed
    mapping(string => AggregatedMetrics) public aggregatedMetrics;
    mapping(string => PlatformConfig) public platformConfigs;
    
    // Events
    event MetricsRecorded(string indexed contentId, string platform, uint256 timestamp);
    event MetricsAggregated(string indexed contentId, uint256 timestamp);
    event PlatformConfigUpdated(string platform, bool active, uint256 weight);

    // References to other contracts
    ContentEngine public contentEngine;

    // Modifiers
    modifier onlyOracle() {
        // In a full implementation, this would check against authorized oracle addresses
        _;
    }

    modifier onlyRegisteredAIZ() {
        // In a full implementation, this would check against the AIZ registry
        _;
    }

    constructor(address _contentEngineAddress) {
        contentEngine = ContentEngine(_contentEngineAddress);
        
        // Initialize default platform configurations
        _setPlatformConfig("twitter", "Twitter", true, 80);
        _setPlatformConfig("linkedin", "LinkedIn", true, 90);
        _setPlatformConfig("instagram", "Instagram", true, 70);
        _setPlatformConfig("youtube", "YouTube", true, 85);
        _setPlatformConfig("tiktok", "TikTok", true, 60);
    }

    /**
     * @dev Record engagement metrics from an oracle
     * @param _contentId Content identifier
     * @param _platform Social media platform
     * @param _views View count
     * @param _likes Like count
     * @param _shares Share count
     * @param _comments Comment count
     * @param _conversions Conversion count
     * @param _reach Reach count
     */
    function recordEngagementMetrics(
        string memory _contentId,
        string memory _platform,
        uint256 _views,
        uint256 _likes,
        uint256 _shares,
        uint256 _comments,
        uint256 _conversions,
        uint256 _reach
    ) external onlyOracle nonReentrant {
        // Check if we've already processed metrics for this content on this platform
        require(!processedMetrics[_contentId][_platform], "Metrics already processed for this content/platform");
        
        string memory metricId = string(abi.encodePacked(_contentId, "_", _platform, "_", Strings.toString(block.timestamp)));
        
        EngagementMetrics storage metrics = engagementMetrics[metricId];
        metrics.contentId = _contentId;
        metrics.platform = _platform;
        metrics.views = _views;
        metrics.likes = _likes;
        metrics.shares = _shares;
        metrics.comments = _comments;
        metrics.conversions = _conversions;
        metrics.reach = _reach;
        metrics.timestamp = block.timestamp;
        metrics.verified = true;
        
        processedMetrics[_contentId][_platform] = true;
        
        // Update aggregated metrics
        _updateAggregatedMetrics(_contentId);
        
        emit MetricsRecorded(_contentId, _platform, block.timestamp);
    }

    /**
     * @dev Update aggregated metrics for content
     * @param _contentId Content identifier
     */
    function _updateAggregatedMetrics(string memory _contentId) internal {
        // Get all platform metrics for this content
        AggregatedMetrics storage agg = aggregatedMetrics[_contentId];
        agg.contentId = _contentId;
        
        uint256 totalWeightedViews = 0;
        uint256 totalWeightedEngagements = 0;
        uint256 totalWeight = 0;
        uint256 platformCount = 0;
        
        // Process each platform configuration
        string[] memory platforms = new string[](5);
        platforms[0] = "twitter";
        platforms[1] = "linkedin";
        platforms[2] = "instagram";
        platforms[3] = "youtube";
        platforms[4] = "tiktok";
        
        for (uint256 i = 0; i < platforms.length; i++) {
            string memory platform = platforms[i];
            if (processedMetrics[_contentId][platform]) {
                // Get the metrics for this platform
                string memory metricId = string(abi.encodePacked(_contentId, "_", platform, "_", Strings.toString(engagementMetrics[string(abi.encodePacked(_contentId, "_", platform, "_", Strings.toString(block.timestamp)))].timestamp)));
                
                // Since we can't easily retrieve the metricId, we'll need to iterate through a mapping
                // This is a simplification - in a production contract, you'd want a better data structure
                EngagementMetrics storage metrics = engagementMetrics[metricId];
                
                // Skip if metrics don't exist for this platform
                if (bytes(metrics.contentId).length == 0) continue;
                
                PlatformConfig storage config = platformConfigs[platform];
                if (!config.active) continue;
                
                uint256 weight = config.weight;
                totalWeightedViews += metrics.views * weight;
                totalWeightedEngagements += (metrics.likes + metrics.shares + metrics.comments) * weight;
                totalWeight += weight;
                platformCount++;
                
                // Update totals
                agg.totalViews += metrics.views;
                agg.totalLikes += metrics.likes;
                agg.totalShares += metrics.shares;
                agg.totalComments += metrics.comments;
                agg.totalConversions += metrics.conversions;
                agg.totalReach += metrics.reach;
            }
        }
        
        if (totalWeight > 0) {
            agg.averageEngagementRate = (totalWeightedEngagements * 10000) / (totalWeightedViews + 1); // Multiply by 10000 for 2 decimal precision
        }
        
        agg.lastUpdated = block.timestamp;
        
        emit MetricsAggregated(_contentId, block.timestamp);
    }

    /**
     * @dev Set platform configuration
     * @param _platformId Platform identifier
     * @param _name Human-readable name
     * @param _active Whether platform is active
     * @param _weight Platform weight for scoring
     */
    function setPlatformConfig(
        string memory _platformId,
        string memory _name,
        bool _active,
        uint256 _weight
    ) external onlyOwner {
        _setPlatformConfig(_platformId, _name, _active, _weight);
    }

    function _setPlatformConfig(
        string memory _platformId,
        string memory _name,
        bool _active,
        uint256 _weight
    ) internal {
        require(_weight <= 100, "Weight must be 0-100");
        
        PlatformConfig storage config = platformConfigs[_platformId];
        config.name = _name;
        config.active = _active;
        config.weight = _weight;
        
        emit PlatformConfigUpdated(_platformId, _active, _weight);
    }

    /**
     * @dev Get engagement metrics
     * @param _metricId Metric identifier
     * @return EngagementMetrics struct
     */
    function getEngagementMetrics(string memory _metricId) 
        external 
        view 
        returns (EngagementMetrics memory) 
    {
        return engagementMetrics[_metricId];
    }

    /**
     * @dev Get aggregated metrics for content
     * @param _contentId Content identifier
     * @return AggregatedMetrics struct
     */
    function getAggregatedMetrics(string memory _contentId) 
        external 
        view 
        returns (AggregatedMetrics memory) 
    {
        return aggregatedMetrics[_contentId];
    }

    /**
     * @dev Get platform configuration
     * @param _platformId Platform identifier
     * @return PlatformConfig struct
     */
    function getPlatformConfig(string memory _platformId) 
        external 
        view 
        returns (PlatformConfig memory) 
    {
        return platformConfigs[_platformId];
    }

    /**
     * @dev Calculate content performance score
     * @param _contentId Content identifier
     * @return Performance score (0-100)
     */
    function calculatePerformanceScore(string memory _contentId) 
        external 
        view 
        returns (uint256) 
    {
        AggregatedMetrics storage agg = aggregatedMetrics[_contentId];
        if (agg.totalViews == 0) return 0;
        
        // Simple scoring algorithm - can be made more sophisticated
        uint256 engagementRate = (agg.totalLikes + agg.totalShares + agg.totalComments) * 100 / agg.totalViews;
        uint256 conversionRate = (agg.totalConversions * 10000) / (agg.totalViews + 1); // Multiply by 10000 for 2 decimal precision
        
        // Weighted score: 70% engagement rate, 30% conversion rate
        uint256 score = (engagementRate * 70 + (conversionRate / 100) * 30) / 100;
        
        return score > 100 ? 100 : score;
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