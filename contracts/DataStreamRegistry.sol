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

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AIZRegistry.sol";

/**
 * @title DataStreamRegistry
 * @dev Registry for shared data streams that AIZs can subscribe to
 * Allows data providers to register streams and earn fees when they are used
 */
contract DataStreamRegistry is Ownable {
    struct DataStream {
        bytes32 id;                    // Unique identifier for the stream
        string name;                   // Name of the stream
        string description;            // Description of the stream
        address provider;              // Provider of the stream
        uint256 fee;                   // Fee for accessing the stream (in wei per period)
        address feeToken;              // Token address for fee (address(0) for ETH)
        uint256 period;                // Billing period in seconds
        uint256 lastUpdated;           // Last time the stream was updated
        bool isActive;                 // Whether the stream is active
        uint256 registrationTimestamp; // When the stream was registered
    }
    
    struct Subscription {
        bytes32 streamId;              // ID of the stream
        bytes32 aizId;                 // ID of the subscribing AIZ
        uint256 startTime;             // When the subscription started
        uint256 endTime;               // When the subscription ends
        uint256 lastBilled;            // Last time the subscriber was billed
        bool isActive;                 // Whether the subscription is active
    }
    
    // Mapping of stream ID to stream
    mapping(bytes32 => DataStream) public streams;
    
    // Mapping of stream name to stream ID
    mapping(string => bytes32) public streamNameToId;
    
    // Mapping of stream ID to subscribers (AIZ ID to subscription)
    mapping(bytes32 => mapping(bytes32 => Subscription)) public subscriptions;
    
    // Mapping of AIZ ID to subscribed streams
    mapping(bytes32 => bytes32[]) public aizSubscriptions;
    
    // List of all stream IDs
    bytes32[] public streamIds;
    
    // Reference to AIZ Registry
    AIZRegistry public aizRegistry;
    
    // Events
    event StreamRegistered(
        bytes32 indexed streamId,
        string name,
        address provider,
        uint256 fee,
        uint256 period
    );
    
    event StreamUpdated(
        bytes32 indexed streamId,
        string name,
        uint256 fee,
        uint256 period
    );
    
    event StreamDeactivated(bytes32 indexed streamId);
    event StreamReactivated(bytes32 indexed streamId);
    
    event SubscriptionCreated(
        bytes32 indexed streamId,
        bytes32 indexed aizId,
        uint256 startTime,
        uint256 endTime
    );
    
    event SubscriptionRenewed(
        bytes32 indexed streamId,
        bytes32 indexed aizId,
        uint256 newEndTime
    );
    
    event SubscriptionCancelled(
        bytes32 indexed streamId,
        bytes32 indexed aizId
    );
    
    event StreamAccessed(
        bytes32 indexed streamId,
        bytes32 indexed aizId,
        address user
    );
    
    event FeeCollected(
        bytes32 indexed streamId,
        bytes32 indexed aizId,
        uint256 amount,
        address token
    );
    
    constructor(address _aizRegistry) {
        aizRegistry = AIZRegistry(_aizRegistry);
    }
    
    /**
     * @dev Register a new data stream
     * @param name Name of the stream
     * @param description Description of the stream
     * @param fee Fee for accessing the stream (in wei per period)
     * @param feeToken Token address for fee (address(0) for ETH)
     * @param period Billing period in seconds
     * @return bytes32 ID of the registered stream
     */
    function registerStream(
        string calldata name,
        string calldata description,
        uint256 fee,
        address feeToken,
        uint256 period
    ) external returns (bytes32) {
        require(bytes(name).length > 0, "Stream name cannot be empty");
        require(period > 0, "Period must be greater than 0");
        require(streamNameToId[name] == bytes32(0), "Stream name already registered");
        
        // Create stream ID
        bytes32 streamId = keccak256(abi.encodePacked(name, msg.sender, block.timestamp));
        
        // Store stream
        streams[streamId] = DataStream({
            id: streamId,
            name: name,
            description: description,
            provider: msg.sender,
            fee: fee,
            feeToken: feeToken,
            period: period,
            lastUpdated: block.timestamp,
            isActive: true,
            registrationTimestamp: block.timestamp
        });
        
        // Map name to ID
        streamNameToId[name] = streamId;
        
        // Add to list
        streamIds.push(streamId);
        
        emit StreamRegistered(streamId, name, msg.sender, fee, period);
        
        return streamId;
    }
    
    /**
     * @dev Update an existing stream
     * @param streamId ID of the stream to update
     * @param description New description of the stream
     * @param fee New fee for accessing the stream (in wei per period)
     * @param period New billing period in seconds
     */
    function updateStream(
        bytes32 streamId,
        string calldata description,
        uint256 fee,
        uint256 period
    ) external {
        require(streams[streamId].id != bytes32(0), "Stream does not exist");
        require(streams[streamId].provider == msg.sender, "Only stream provider can update");
        require(period > 0, "Period must be greater than 0");
        
        DataStream storage stream = streams[streamId];
        stream.description = description;
        stream.fee = fee;
        stream.period = period;
        stream.lastUpdated = block.timestamp;
        
        emit StreamUpdated(streamId, stream.name, fee, period);
    }
    
    /**
     * @dev Deactivate a stream
     * @param streamId ID of the stream to deactivate
     */
    function deactivateStream(bytes32 streamId) external {
        require(streams[streamId].id != bytes32(0), "Stream does not exist");
        require(streams[streamId].provider == msg.sender, "Only stream provider can deactivate");
        
        streams[streamId].isActive = false;
        
        emit StreamDeactivated(streamId);
    }
    
    /**
     * @dev Reactivate a stream
     * @param streamId ID of the stream to reactivate
     */
    function reactivateStream(bytes32 streamId) external {
        require(streams[streamId].id != bytes32(0), "Stream does not exist");
        require(streams[streamId].provider == msg.sender, "Only stream provider can reactivate");
        
        streams[streamId].isActive = true;
        
        emit StreamReactivated(streamId);
    }
    
    /**
     * @dev Subscribe to a data stream
     * @param streamId ID of the stream to subscribe to
     * @param duration Duration of subscription in seconds
     */
    function subscribeToStream(bytes32 streamId, uint256 duration) external {
        // Verify that the stream exists and is active
        DataStream storage stream = streams[streamId];
        require(stream.id != bytes32(0), "Stream does not exist");
        require(stream.isActive, "Stream is not active");
        
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // Calculate subscription end time
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;
        
        // Store subscription
        subscriptions[streamId][aizId] = Subscription({
            streamId: streamId,
            aizId: aizId,
            startTime: startTime,
            endTime: endTime,
            lastBilled: startTime,
            isActive: true
        });
        
        // Add to AIZ's subscription list
        aizSubscriptions[aizId].push(streamId);
        
        // TODO: Collect initial fee
        // This would require implementing fee collection logic
        
        emit SubscriptionCreated(streamId, aizId, startTime, endTime);
    }
    
    /**
     * @dev Renew a subscription
     * @param streamId ID of the stream to renew
     * @param duration Additional duration in seconds
     */
    function renewSubscription(bytes32 streamId, uint256 duration) external {
        // Verify that the subscription exists and is active
        Subscription storage subscription = subscriptions[streamId][aizRegistry.getAIZByContract(block.chainid, msg.sender)];
        require(subscription.streamId != bytes32(0), "Subscription does not exist");
        require(subscription.isActive, "Subscription is not active");
        
        // Extend subscription
        subscription.endTime += duration;
        
        // TODO: Collect renewal fee
        // This would require implementing fee collection logic
        
        emit SubscriptionRenewed(streamId, subscription.aizId, subscription.endTime);
    }
    
    /**
     * @dev Cancel a subscription
     * @param streamId ID of the stream to cancel subscription for
     */
    function cancelSubscription(bytes32 streamId) external {
        // Verify that the subscription exists and is active
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        Subscription storage subscription = subscriptions[streamId][aizId];
        require(subscription.streamId != bytes32(0), "Subscription does not exist");
        require(subscription.isActive, "Subscription is not active");
        
        // Cancel subscription
        subscription.isActive = false;
        
        emit SubscriptionCancelled(streamId, aizId);
    }
    
    /**
     * @dev Access a data stream
     * @param streamId ID of the stream to access
     * @return bytes Data from the stream
     */
    function accessStream(bytes32 streamId) external returns (bytes memory) {
        // Verify that the stream exists and is active
        DataStream storage stream = streams[streamId];
        require(stream.id != bytes32(0), "Stream does not exist");
        require(stream.isActive, "Stream is not active");
        
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // Verify that the AIZ has an active subscription
        Subscription storage subscription = subscriptions[streamId][aizId];
        require(subscription.streamId != bytes32(0), "No subscription for this stream");
        require(subscription.isActive, "Subscription is not active");
        require(block.timestamp <= subscription.endTime, "Subscription has expired");
        
        emit StreamAccessed(streamId, aizId, msg.sender);
        
        // TODO: Return actual stream data
        // This would require implementing the actual data retrieval logic
        // For now, we'll return empty bytes
        return new bytes(0);
    }
    
    /**
     * @dev Bill subscribers for a stream
     * @param streamId ID of the stream to bill subscribers for
     */
    function billSubscribers(bytes32 streamId) external {
        // Verify that the stream exists
        DataStream storage stream = streams[streamId];
        require(stream.id != bytes32(0), "Stream does not exist");
        require(stream.provider == msg.sender, "Only stream provider can bill subscribers");
        
        // TODO: Implement billing logic
        // This would require iterating through subscribers and collecting fees
        // based on the time since last billing
    }
    
    /**
     * @dev Get stream information
     * @param streamId ID of the stream
     * @return DataStream information
     */
    function getStream(bytes32 streamId) external view returns (DataStream memory) {
        return streams[streamId];
    }
    
    /**
     * @dev Get stream ID by name
     * @param name Name of the stream
     * @return Stream ID
     */
    function getStreamIdByName(string calldata name) external view returns (bytes32) {
        return streamNameToId[name];
    }
    
    /**
     * @dev Get subscription information
     * @param streamId ID of the stream
     * @param aizId ID of the AIZ
     * @return Subscription information
     */
    function getSubscription(bytes32 streamId, bytes32 aizId) external view returns (Subscription memory) {
        return subscriptions[streamId][aizId];
    }
    
    /**
     * @dev Check if an AIZ is subscribed to a stream
     * @param streamId ID of the stream
     * @param aizId ID of the AIZ
     * @return bool Whether the AIZ is subscribed to the stream
     */
    function isSubscribed(bytes32 streamId, bytes32 aizId) external view returns (bool) {
        return subscriptions[streamId][aizId].isActive && 
               block.timestamp <= subscriptions[streamId][aizId].endTime;
    }
    
    /**
     * @dev Get total number of registered streams
     * @return Count of streams
     */
    function getTotalStreams() external view returns (uint256) {
        return streamIds.length;
    }
    
    /**
     * @dev Get stream IDs in a range
     * @param start Start index
     * @param count Number of IDs to retrieve
     * @return Array of stream IDs
     */
    function getStreamIds(uint256 start, uint256 count) external view returns (bytes32[] memory) {
        require(start < streamIds.length, "Start index out of bounds");
        uint256 end = start + count;
        if (end > streamIds.length) {
            end = streamIds.length;
        }
        
        bytes32[] memory result = new bytes32[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = streamIds[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get streams subscribed by an AIZ
     * @param aizId ID of the AIZ
     * @return Array of stream IDs
     */
    function getAIZSubscriptions(bytes32 aizId) external view returns (bytes32[] memory) {
        return aizSubscriptions[aizId];
    }
}