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
pragma solidity ^0.8.19;

import "./AIZOrchestrator.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MetaSelfMonitoringAIZ
 * @dev AIZ implementation with self-monitoring capabilities that observe cognitive processes,
 * task execution workflows, and outcome results to autonomously refine decision-making algorithms
 */
contract MetaSelfMonitoringAIZ is AIZOrchestrator {
    // Struct to store performance metrics
    struct PerformanceMetrics {
        uint256 totalOperations;
        uint256 successfulOperations;
        uint256 failedOperations;
        uint256 avgResponseTimeMs;
        uint256 totalResponseTimeMs;
        uint256 memoryUsageMb;
        uint256 lastUpdated;
    }
    
    // Struct to store optimization suggestions
    struct OptimizationSuggestion {
        uint256 id;
        string category;
        string title;
        string description;
        string recommendation;
        uint256 estimatedSavings;
        uint256 confidence; // 0-100
        bool implemented;
        uint256 createdAt;
    }
    
    // Struct to store self-monitoring reports
    struct MonitoringReport {
        uint256 timestamp;
        uint256 efficiencyScore; // 0-100
        string healthStatus;
        uint256 totalSuggestions;
        uint256 implementedSuggestions;
        PerformanceMetrics metrics;
    }
    
    // Performance metrics storage
    mapping(uint256 => PerformanceMetrics) public dailyMetrics;
    mapping(uint256 => MonitoringReport) public monitoringReports;
    mapping(uint256 => OptimizationSuggestion) public optimizationSuggestions;
    
    // Counters
    uint256 public totalReports;
    uint256 public totalSuggestions;
    uint256 public totalImplementedSuggestions;
    
    // Configuration
    uint256 public monitoringInterval; // seconds
    uint256 public lastMonitoringCheck;
    
    // Events
    event PerformanceMetricsUpdated(
        uint256 date,
        uint256 totalOperations,
        uint256 successRate,
        uint256 avgResponseTimeMs
    );
    
    event OptimizationSuggestionCreated(
        uint256 suggestionId,
        string category,
        string title,
        uint256 confidence
    );
    
    event OptimizationSuggestionImplemented(
        uint256 suggestionId,
        uint256 savingsAchieved
    );
    
    event MonitoringReportGenerated(
        uint256 reportId,
        uint256 efficiencyScore,
        string healthStatus
    );
    
    event SelfOptimizationApplied(
        string optimizationType,
        uint256 improvementPercentage
    );
    
    /**
     * @dev Constructor to initialize the Meta Self-Monitoring AIZ
     * @param _aizId Unique identifier for this AIZ
     * @param _aizRegistry Address of the AIZ registry contract
     * @param _decisionLogger Address of the decision logger contract
     * @param _aizName Human-readable name of the AIZ
     * @param _aizDescription Description of the AIZ's purpose
     */
    constructor(
        bytes32 _aizId,
        address _aizRegistry,
        address _decisionLogger,
        string memory _aizName,
        string memory _aizDescription
    ) AIZOrchestrator(_aizId, _aizRegistry, _decisionLogger, _aizName, _aizDescription) {
        monitoringInterval = 86400; // 24 hours
        lastMonitoringCheck = block.timestamp;
        
        emit AIZInitialized(_aizId, _aizName, _aizRegistry, _decisionLogger);
    }
    
    /**
     * @dev Update performance metrics
     * @param operationsCount Number of operations performed
     * @param successCount Number of successful operations
     * @param failedCount Number of failed operations
     * @param avgResponseTimeMs Average response time in milliseconds
     * @param memoryUsageMb Memory usage in MB
     */
    function updatePerformanceMetrics(
        uint256 operationsCount,
        uint256 successCount,
        uint256 failedCount,
        uint256 avgResponseTimeMs,
        uint256 memoryUsageMb
    ) external onlyOwner {
        requireCapability("canUpdateMetrics");
        
        uint256 today = block.timestamp / 86400; // Get current day
        PerformanceMetrics storage metrics = dailyMetrics[today];
        
        metrics.totalOperations += operationsCount;
        metrics.successfulOperations += successCount;
        metrics.failedOperations += failedCount;
        metrics.totalResponseTimeMs += avgResponseTimeMs * operationsCount;
        metrics.memoryUsageMb = memoryUsageMb; // Update to latest value
        metrics.lastUpdated = block.timestamp;
        
        // Calculate average response time
        if (metrics.totalOperations > 0) {
            metrics.avgResponseTimeMs = metrics.totalResponseTimeMs / metrics.totalOperations;
        }
        
        emit PerformanceMetricsUpdated(
            today,
            metrics.totalOperations,
            metrics.totalOperations > 0 ? (metrics.successfulOperations * 100) / metrics.totalOperations : 0,
            metrics.avgResponseTimeMs
        );
        
        executeActionWithCapability("canUpdateMetrics", "updatePerformanceMetrics");
    }
    
    /**
     * @dev Analyze performance and generate optimization suggestions
     */
    function analyzePerformance() external {
        requireCapability("canAnalyzePerformance");
        
        uint256 today = block.timestamp / 86400;
        PerformanceMetrics storage currentMetrics = dailyMetrics[today];
        
        // Check for memory leaks
        if (currentMetrics.memoryUsageMb > 512) {
            createOptimizationSuggestion(
                "memory",
                "Potential Memory Leak Detected",
                string(abi.encodePacked("Memory usage is ", Strings.toString(currentMetrics.memoryUsageMb), "MB, which exceeds threshold")),
                "Check for unclosed connections, unreleased timers, or circular references",
                currentMetrics.memoryUsageMb / 4, // Estimated 25% savings
                85 // Confidence
            );
        }
        
        // Check for slow operations
        if (currentMetrics.avgResponseTimeMs > 200) {
            createOptimizationSuggestion(
                "performance",
                "Slow Operations Detected",
                string(abi.encodePacked("Average response time is ", Strings.toString(currentMetrics.avgResponseTimeMs), "ms, which exceeds threshold")),
                "Add caching, parallelize operations, or use pagination",
                currentMetrics.avgResponseTimeMs / 4, // Estimated 25% improvement
                90 // Confidence
            );
        }
        
        // Check for high error rate
        if (currentMetrics.totalOperations > 0) {
            uint256 errorRate = (currentMetrics.failedOperations * 100) / currentMetrics.totalOperations;
            if (errorRate > 5) {
                createOptimizationSuggestion(
                    "reliability",
                    "High Error Rate Detected",
                    string(abi.encodePacked("Error rate is ", Strings.toString(errorRate), "%, which exceeds threshold")),
                    "Improve error handling, add retry logic with backoff, or fix root causes",
                    errorRate / 2, // Estimated improvement
                    80 // Confidence
                );
            }
        }
        
        // Check for idle resources
        if (currentMetrics.totalOperations < 10 && currentMetrics.memoryUsageMb > 256) {
            createOptimizationSuggestion(
                "resource",
                "Idle Resources Consuming Memory",
                string(abi.encodePacked("Low activity (", Strings.toString(currentMetrics.totalOperations), " operations) but high memory usage (", Strings.toString(currentMetrics.memoryUsageMb), "MB)")),
                "Enable dynamic scaling or shut down unused services during low-traffic periods",
                currentMetrics.memoryUsageMb / 3, // Estimated 33% savings
                75 // Confidence
            );
        }
        
        executeActionWithCapability("canAnalyzePerformance", "analyzePerformance");
    }
    
    /**
     * @dev Create an optimization suggestion
     * @param category Category of the suggestion
     * @param title Title of the suggestion
     * @param description Description of the issue
     * @param recommendation Recommended solution
     * @param estimatedSavings Estimated savings from implementation
     * @param confidence Confidence level (0-100)
     */
    function createOptimizationSuggestion(
        string memory category,
        string memory title,
        string memory description,
        string memory recommendation,
        uint256 estimatedSavings,
        uint256 confidence
    ) internal {
        totalSuggestions++;
        
        optimizationSuggestions[totalSuggestions] = OptimizationSuggestion({
            id: totalSuggestions,
            category: category,
            title: title,
            description: description,
            recommendation: recommendation,
            estimatedSavings: estimatedSavings,
            confidence: confidence,
            implemented: false,
            createdAt: block.timestamp
        });
        
        emit OptimizationSuggestionCreated(
            totalSuggestions,
            category,
            title,
            confidence
        );
    }
    
    /**
     * @dev Implement an optimization suggestion
     * @param suggestionId ID of the suggestion to implement
     */
    function implementOptimization(uint256 suggestionId) external onlyOwner {
        requireCapability("canImplementOptimizations");
        require(optimizationSuggestions[suggestionId].id != 0, "Suggestion does not exist");
        require(!optimizationSuggestions[suggestionId].implemented, "Suggestion already implemented");
        
        OptimizationSuggestion storage suggestion = optimizationSuggestions[suggestionId];
        suggestion.implemented = true;
        totalImplementedSuggestions++;
        
        emit OptimizationSuggestionImplemented(
            suggestionId,
            suggestion.estimatedSavings
        );
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = string(abi.encodePacked("AIZ-", aizName));
        
        logConsciousDecision(
            "Self-Optimization",
            collaborators,
            string(abi.encodePacked('{"', suggestion.category, '": "', suggestion.title, '"}')),
            string(abi.encodePacked('{"optimization": "', suggestion.recommendation, '"}')),
            string(abi.encodePacked('{"confidence": ', Strings.toString(suggestion.confidence), '}')),
            string(abi.encodePacked('{"savings": ', Strings.toString(suggestion.estimatedSavings), '}'))
        );
        
        executeActionWithCapability("canImplementOptimizations", "implementOptimization");
    }
    
    /**
     * @dev Generate a monitoring report
     * @return reportId ID of the generated report
     */
    function generateMonitoringReport() external returns (uint256 reportId) {
        requireCapability("canGenerateReports");
        
        uint256 today = block.timestamp / 86400;
        PerformanceMetrics storage currentMetrics = dailyMetrics[today];
        
        // Calculate efficiency score
        uint256 efficiencyScore = calculateEfficiencyScore(currentMetrics);
        
        // Determine health status
        string memory healthStatus = determineHealthStatus(efficiencyScore, currentMetrics);
        
        // Count suggestions
        uint256 implementedSuggestions = totalImplementedSuggestions;
        uint256 suggestions = totalSuggestions;
        
        totalReports++;
        reportId = totalReports;
        
        monitoringReports[reportId] = MonitoringReport({
            timestamp: block.timestamp,
            efficiencyScore: efficiencyScore,
            healthStatus: healthStatus,
            totalSuggestions: suggestions,
            implementedSuggestions: implementedSuggestions,
            metrics: currentMetrics
        });
        
        emit MonitoringReportGenerated(reportId, efficiencyScore, healthStatus);
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = string(abi.encodePacked("AIZ-", aizName));
        
        logConsciousDecision(
            "Monitoring Report Generation",
            collaborators,
            string(abi.encodePacked('{"efficiency": ', Strings.toString(efficiencyScore), '}')),
            string(abi.encodePacked('{"status": "', healthStatus, '"}')),
            string(abi.encodePacked('{"suggestions": ', Strings.toString(suggestions), '}')),
            string(abi.encodePacked('{"implemented": ', Strings.toString(implementedSuggestions), '}'))
        );
        
        executeActionWithCapability("canGenerateReports", "generateMonitoringReport");
        
        return reportId;
    }
    
    /**
     * @dev Calculate efficiency score based on metrics
     * @param metrics Performance metrics to analyze
     * @return efficiencyScore Score from 0-100
     */
    function calculateEfficiencyScore(PerformanceMetrics memory metrics) internal pure returns (uint256 efficiencyScore) {
        efficiencyScore = 100;
        
        // Deduct for errors
        if (metrics.totalOperations > 0) {
            uint256 errorRate = (metrics.failedOperations * 100) / metrics.totalOperations;
            efficiencyScore -= errorRate * 3; // Up to 300 points deduction for 100% error rate
        }
        
        // Deduct for slow response
        if (metrics.avgResponseTimeMs > 100) {
            efficiencyScore -= (metrics.avgResponseTimeMs - 100) / 10; // 1 point per 10ms over 100ms
        }
        
        // Deduct for high memory
        if (metrics.memoryUsageMb > 512) {
            efficiencyScore -= (metrics.memoryUsageMb - 512) / 20; // 1 point per 20MB over 512MB
        }
        
        // Ensure score is between 0 and 100
        if (efficiencyScore > 100) {
            efficiencyScore = 100;
        } else if (efficiencyScore < 0) {
            efficiencyScore = 0;
        }
    }
    
    /**
     * @dev Determine health status based on efficiency score and metrics
     * @param efficiencyScore Efficiency score
     * @param metrics Performance metrics
     * @return healthStatus Health status string
     */
    function determineHealthStatus(uint256 efficiencyScore, PerformanceMetrics memory metrics) internal pure returns (string memory healthStatus) {
        if (efficiencyScore >= 90) {
            healthStatus = "Excellent";
        } else if (efficiencyScore >= 75) {
            healthStatus = "Good";
        } else if (efficiencyScore >= 60) {
            healthStatus = "Fair";
        } else if (efficiencyScore >= 40) {
            healthStatus = "Poor";
        } else {
            healthStatus = "Critical";
        }
    }
    
    /**
     * @dev Apply self-optimization based on monitoring data
     * @param optimizationType Type of optimization to apply
     * @param improvementPercentage Expected improvement percentage
     */
    function applySelfOptimization(string memory optimizationType, uint256 improvementPercentage) external onlyOwner {
        requireCapability("canApplyOptimizations");
        
        // In a real implementation, this would actually modify the system behavior
        // For now, we just log the event
        
        emit SelfOptimizationApplied(optimizationType, improvementPercentage);
        
        // Log the conscious decision
        string[] memory collaborators = new string[](1);
        collaborators[0] = string(abi.encodePacked("AIZ-", aizName));
        
        logConsciousDecision(
            "Self-Optimization Applied",
            collaborators,
            string(abi.encodePacked('{"type": "', optimizationType, '"}')),
            string(abi.encodePacked('{"improvement": ', Strings.toString(improvementPercentage), '}')),
            '{"consciousness": "self-awareness"}',
            '{"state": "adaptive-evolution"}'
        );
        
        executeActionWithCapability("canApplyOptimizations", "applySelfOptimization");
    }
    
    /**
     * @dev Get the latest monitoring report
     * @return report Latest monitoring report
     */
    function getLatestReport() external view returns (MonitoringReport memory report) {
        if (totalReports > 0) {
            return monitoringReports[totalReports];
        }
        
        // Return empty report if none exists
        PerformanceMetrics memory emptyMetrics;
        report = MonitoringReport({
            timestamp: 0,
            efficiencyScore: 0,
            healthStatus: "Unknown",
            totalSuggestions: 0,
            implementedSuggestions: 0,
            metrics: emptyMetrics
        });
    }
    
    /**
     * @dev Get optimization suggestions
     * @param startId Starting suggestion ID
     * @param count Number of suggestions to return
     * @return suggestions Array of optimization suggestions
     */
    function getOptimizationSuggestions(uint256 startId, uint256 count) external view returns (OptimizationSuggestion[] memory suggestions) {
        uint256 endIndex = startId + count - 1;
        if (endIndex > totalSuggestions) {
            endIndex = totalSuggestions;
        }
        
        uint256 resultCount = endIndex - startId + 1;
        suggestions = new OptimizationSuggestion[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            suggestions[i] = optimizationSuggestions[startId + i];
        }
        
        return suggestions;
    }
    
    /**
     * @dev Set monitoring interval
     * @param intervalSeconds Interval in seconds
     */
    function setMonitoringInterval(uint256 intervalSeconds) external onlyOwner {
        monitoringInterval = intervalSeconds;
    }
}