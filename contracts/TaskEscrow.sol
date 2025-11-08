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

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TaskEscrow
 * @dev Escrow contract for agent-to-agent task payments
 * Holds ZXT tokens until task completion or dispute resolution
 */
contract TaskEscrow is ReentrancyGuard {
    IERC20 public token;
    address public owner;
    uint256 public escrowCount;
    
    struct Escrow {
        bytes32 id;
        address payer;
        address worker;
        uint256 amount;
        uint256 createdAt;
        bool released;
        bool refunded;
        string taskDescription;
    }
    
    mapping(bytes32 => Escrow) public escrows;
    mapping(address => uint256) public totalEscrowed;
    
    event EscrowCreated(
        bytes32 indexed id,
        address indexed payer,
        address indexed worker,
        uint256 amount,
        string taskDescription
    );
    
    event EscrowReleased(bytes32 indexed id, address worker, uint256 amount);
    event EscrowRefunded(bytes32 indexed id, address payer, uint256 amount);
    
    constructor(address _token) {
        token = IERC20(_token);
        owner = msg.sender;
    }
    
    /**
     * @dev Create escrow for a task
     * @param id Unique task identifier
     * @param worker Agent performing the task
     * @param amount ZXT tokens to escrow
     * @param taskDescription Description of task
     */
    function createEscrow(
        bytes32 id,
        address worker,
        uint256 amount,
        string calldata taskDescription
    ) external nonReentrant {
        require(escrows[id].payer == address(0), "Escrow already exists");
        require(worker != address(0), "Invalid worker address");
        require(amount > 0, "Amount must be positive");
        require(worker != msg.sender, "Cannot escrow to self");
        
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        escrows[id] = Escrow({
            id: id,
            payer: msg.sender,
            worker: worker,
            amount: amount,
            createdAt: block.timestamp,
            released: false,
            refunded: false,
            taskDescription: taskDescription
        });
        
        totalEscrowed[msg.sender] += amount;
        escrowCount++;
        
        emit EscrowCreated(id, msg.sender, worker, amount, taskDescription);
    }
    
    /**
     * @dev Release escrowed funds to worker
     * @param id Task identifier
     */
    function release(bytes32 id) external nonReentrant {
        Escrow storage e = escrows[id];
        require(
            msg.sender == e.payer || msg.sender == owner,
            "Not authorized to release"
        );
        require(!e.released, "Already released");
        require(!e.refunded, "Already refunded");
        
        e.released = true;
        totalEscrowed[e.payer] -= e.amount;
        
        require(token.transfer(e.worker, e.amount), "Transfer failed");
        
        emit EscrowReleased(id, e.worker, e.amount);
    }
    
    /**
     * @dev Refund escrowed funds to payer
     * @param id Task identifier
     */
    function refund(bytes32 id) external nonReentrant {
        Escrow storage e = escrows[id];
        require(
            msg.sender == e.worker || msg.sender == owner,
            "Not authorized to refund"
        );
        require(!e.released, "Already released");
        require(!e.refunded, "Already refunded");
        
        e.refunded = true;
        totalEscrowed[e.payer] -= e.amount;
        
        require(token.transfer(e.payer, e.amount), "Transfer failed");
        
        emit EscrowRefunded(id, e.payer, e.amount);
    }
    
    /**
     * @dev Get escrow details
     * @param id Task identifier
     */
    function getEscrow(bytes32 id) external view returns (Escrow memory) {
        return escrows[id];
    }
    
    /**
     * @dev Emergency withdrawal (owner only)
     * @param id Task identifier
     */
    function emergencyWithdraw(bytes32 id) external {
        require(msg.sender == owner, "Owner only");
        Escrow storage e = escrows[id];
        require(!e.released && !e.refunded, "Already processed");
        
        // Check if escrow is older than 30 days
        require(
            block.timestamp > e.createdAt + 30 days,
            "Too early for emergency"
        );
        
        e.refunded = true;
        totalEscrowed[e.payer] -= e.amount;
        
        require(token.transfer(e.payer, e.amount), "Transfer failed");
        
        emit EscrowRefunded(id, e.payer, e.amount);
    }
}
