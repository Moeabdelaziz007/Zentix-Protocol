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
 * @title ToolRegistry
 * @dev Registry for shared tools that AIZs can use
 * Allows developers to register tools and earn fees when they are used
 */
contract ToolRegistry is Ownable {
    struct Tool {
        bytes32 id;                    // Unique identifier for the tool
        string name;                   // Name of the tool
        string description;            // Description of the tool
        address owner;                 // Owner of the tool
        address toolAddress;           // Address of the tool contract
        uint256 fee;                   // Fee for using the tool (in wei)
        address feeToken;              // Token address for fee (address(0) for ETH)
        uint256 usageCount;            // Number of times the tool has been used
        bool isActive;                 // Whether the tool is active
        uint256 registrationTimestamp; // When the tool was registered
    }
    
    // Mapping of tool ID to tool
    mapping(bytes32 => Tool) public tools;
    
    // Mapping of tool name to tool ID
    mapping(string => bytes32) public toolNameToId;
    
    // List of all tool IDs
    bytes32[] public toolIds;
    
    // Reference to AIZ Registry
    AIZRegistry public aizRegistry;
    
    // Events
    event ToolRegistered(
        bytes32 indexed toolId,
        string name,
        address owner,
        address toolAddress,
        uint256 fee
    );
    
    event ToolUpdated(
        bytes32 indexed toolId,
        string name,
        address toolAddress,
        uint256 fee
    );
    
    event ToolDeactivated(bytes32 indexed toolId);
    event ToolReactivated(bytes32 indexed toolId);
    
    event ToolUsed(
        bytes32 indexed toolId,
        bytes32 indexed aizId,
        address user,
        uint256 fee
    );
    
    constructor(address _aizRegistry) {
        aizRegistry = AIZRegistry(_aizRegistry);
    }
    
    /**
     * @dev Register a new tool
     * @param name Name of the tool
     * @param description Description of the tool
     * @param toolAddress Address of the tool contract
     * @param fee Fee for using the tool (in wei)
     * @param feeToken Token address for fee (address(0) for ETH)
     * @return bytes32 ID of the registered tool
     */
    function registerTool(
        string calldata name,
        string calldata description,
        address toolAddress,
        uint256 fee,
        address feeToken
    ) external returns (bytes32) {
        require(bytes(name).length > 0, "Tool name cannot be empty");
        require(toolAddress != address(0), "Tool address cannot be zero");
        require(toolNameToId[name] == bytes32(0), "Tool name already registered");
        
        // Create tool ID
        bytes32 toolId = keccak256(abi.encodePacked(name, msg.sender, block.timestamp));
        
        // Store tool
        tools[toolId] = Tool({
            id: toolId,
            name: name,
            description: description,
            owner: msg.sender,
            toolAddress: toolAddress,
            fee: fee,
            feeToken: feeToken,
            usageCount: 0,
            isActive: true,
            registrationTimestamp: block.timestamp
        });
        
        // Map name to ID
        toolNameToId[name] = toolId;
        
        // Add to list
        toolIds.push(toolId);
        
        emit ToolRegistered(toolId, name, msg.sender, toolAddress, fee);
        
        return toolId;
    }
    
    /**
     * @dev Update an existing tool
     * @param toolId ID of the tool to update
     * @param description New description of the tool
     * @param toolAddress New address of the tool contract
     * @param fee New fee for using the tool (in wei)
     */
    function updateTool(
        bytes32 toolId,
        string calldata description,
        address toolAddress,
        uint256 fee
    ) external {
        require(tools[toolId].id != bytes32(0), "Tool does not exist");
        require(tools[toolId].owner == msg.sender, "Only tool owner can update");
        
        Tool storage tool = tools[toolId];
        tool.description = description;
        tool.toolAddress = toolAddress;
        tool.fee = fee;
        
        emit ToolUpdated(toolId, tool.name, toolAddress, fee);
    }
    
    /**
     * @dev Deactivate a tool
     * @param toolId ID of the tool to deactivate
     */
    function deactivateTool(bytes32 toolId) external {
        require(tools[toolId].id != bytes32(0), "Tool does not exist");
        require(tools[toolId].owner == msg.sender, "Only tool owner can deactivate");
        
        tools[toolId].isActive = false;
        
        emit ToolDeactivated(toolId);
    }
    
    /**
     * @dev Reactivate a tool
     * @param toolId ID of the tool to reactivate
     */
    function reactivateTool(bytes32 toolId) external {
        require(tools[toolId].id != bytes32(0), "Tool does not exist");
        require(tools[toolId].owner == msg.sender, "Only tool owner can reactivate");
        
        tools[toolId].isActive = true;
        
        emit ToolReactivated(toolId);
    }
    
    /**
     * @dev Use a tool
     * @param toolId ID of the tool to use
     * @param data Data to pass to the tool
     * @return bytes Response from the tool
     */
    function useTool(bytes32 toolId, bytes calldata data) external returns (bytes memory) {
        // Verify that the tool exists and is active
        Tool storage tool = tools[toolId];
        require(tool.id != bytes32(0), "Tool does not exist");
        require(tool.isActive, "Tool is not active");
        
        // Verify that the caller is an active AIZ
        bytes32 aizId = aizRegistry.getAIZByContract(block.chainid, msg.sender);
        require(aizId != bytes32(0), "Caller is not a registered AIZ contract");
        require(aizRegistry.isAIZActive(aizId), "AIZ is not active");
        
        // Increment usage count
        tool.usageCount++;
        
        // TODO: Transfer fee to tool owner
        // This would require implementing fee transfer logic
        
        emit ToolUsed(toolId, aizId, msg.sender, tool.fee);
        
        // Call the tool contract
        // Note: This is a simplified implementation. In practice, you would need
        // to define a standard interface for tools and call the appropriate function.
        (bool success, bytes memory result) = tool.toolAddress.call(data);
        require(success, "Tool execution failed");
        
        return result;
    }
    
    /**
     * @dev Get tool information
     * @param toolId ID of the tool
     * @return Tool information
     */
    function getTool(bytes32 toolId) external view returns (Tool memory) {
        return tools[toolId];
    }
    
    /**
     * @dev Get tool ID by name
     * @param name Name of the tool
     * @return Tool ID
     */
    function getToolIdByName(string calldata name) external view returns (bytes32) {
        return toolNameToId[name];
    }
    
    /**
     * @dev Get total number of registered tools
     * @return Count of tools
     */
    function getTotalTools() external view returns (uint256) {
        return toolIds.length;
    }
    
    /**
     * @dev Get tool IDs in a range
     * @param start Start index
     * @param count Number of IDs to retrieve
     * @return Array of tool IDs
     */
    function getToolIds(uint256 start, uint256 count) external view returns (bytes32[] memory) {
        require(start < toolIds.length, "Start index out of bounds");
        uint256 end = start + count;
        if (end > toolIds.length) {
            end = toolIds.length;
        }
        
        bytes32[] memory result = new bytes32[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = toolIds[i];
        }
        
        return result;
    }
}