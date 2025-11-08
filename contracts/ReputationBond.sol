// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./AIZRegistry.sol";
import "./DynamicReputationProtocol.sol";
import "./ZXTToken.sol";

/**
 * @title ReputationBond
 * @dev Tradable reputation bonds for AIZs to raise capital with reputation staking
 * Investors can purchase bonds and receive repayment with interest, secured by AIZ reputation
 */
contract ReputationBond is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    // Structure to hold bond information
    struct Bond {
        uint256 bondId;
        bytes32 aizId;                 // AIZ that issued the bond
        address issuer;                // Address of the AIZ orchestrator
        uint256 principal;             // Principal amount in USDC
        uint256 interestRate;          // Annual interest rate (basis points, e.g., 500 = 5%)
        uint256 duration;              // Bond duration in seconds
        uint256 issuanceTimestamp;     // When the bond was issued
        uint256 maturityTimestamp;     // When the bond matures
        uint256 reputationStaked;      // Amount of reputation points staked
        address investor;              // Address of the bond investor
        uint256 repaymentAmount;       // Total repayment amount (principal + interest)
        bool isRepaid;                 // Whether the bond has been repaid
        bool isDefaulted;              // Whether the bond has defaulted
    }
    
    // Structure to hold bond issuance parameters
    struct BondIssuanceParams {
        bytes32 aizId;
        uint256 principal;
        uint256 interestRate;
        uint256 duration;
        uint256 reputationStaked;
    }
    
    // References
    AIZRegistry public aizRegistry;
    DynamicReputationProtocol public reputationProtocol;
    IERC20 public usdcToken;
    ZXTToken public zxtToken;
    
    // Treasury address for protocol fees
    address public treasury;
    
    // Bond storage
    mapping(uint256 => Bond) public bonds;
    mapping(bytes32 => uint256[]) public aizBonds; // aizId => bondIds
    mapping(address => uint256[]) public investorBonds; // investor => bondIds
    
    // Counters
    uint256 public bondCount;
    
    // Protocol fee (percentage)
    uint256 public protocolFee = 5; // 5% protocol fee on bond issuance
    
    // Events
    event BondIssued(
        uint256 indexed bondId,
        bytes32 indexed aizId,
        uint256 principal,
        uint256 interestRate,
        uint256 duration,
        uint256 reputationStaked
    );
    
    event BondPurchased(
        uint256 indexed bondId,
        address indexed investor,
        uint256 amountPaid
    );
    
    event BondRepaid(
        uint256 indexed bondId,
        uint256 amountRepaid,
        uint256 reputationReturned
    );
    
    event BondDefaulted(
        uint256 indexed bondId,
        uint256 amountToInvestor,
        uint256 reputationBurned
    );
    
    event ProtocolFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );
    
    constructor(
        address _aizRegistry,
        address _reputationProtocol,
        address _usdcToken,
        address _zxtToken,
        address _treasury
    ) ERC721("Zentix Reputation Bond", "ZRB") {
        aizRegistry = AIZRegistry(_aizRegistry);
        reputationProtocol = DynamicReputationProtocol(_reputationProtocol);
        usdcToken = IERC20(_usdcToken);
        zxtToken = ZXTToken(_zxtToken);
        treasury = _treasury;
    }
    
    /**
     * @dev Issue a new reputation bond
     * @param params Bond issuance parameters
     * @return uint256 Bond ID
     */
    function issueBond(BondIssuanceParams memory params) external returns (uint256) {
        // Verify that the caller is an active AIZ orchestrator
        require(aizRegistry.isAIZOperator(params.aizId, msg.sender), "Not authorized AIZ operator");
        require(aizRegistry.isAIZActive(params.aizId), "AIZ is not active");
        
        // Validate parameters
        require(params.principal > 0, "Principal must be greater than zero");
        require(params.interestRate > 0, "Interest rate must be greater than zero");
        require(params.duration > 0, "Duration must be greater than zero");
        require(params.reputationStaked > 0, "Reputation staked must be greater than zero");
        
        // Check AIZ reputation score
        DynamicReputationProtocol.AIZReputation memory reputation = reputationProtocol.getAIZReputation(params.aizId);
        require(reputation.score >= params.reputationStaked, "Insufficient reputation score");
        
        // Stake reputation
        // This would require implementing a method in DynamicReputationProtocol
        // reputationProtocol.stakeReputation(params.aizId, params.reputationStaked, "Bond issuance");
        
        // Create bond
        bondCount++;
        uint256 bondId = bondCount;
        
        // Calculate repayment amount (simple interest)
        uint256 interest = (params.principal * params.interestRate * params.duration) / (365 * 24 * 60 * 60 * 10000);
        uint256 repaymentAmount = params.principal + interest;
        
        bonds[bondId] = Bond({
            bondId: bondId,
            aizId: params.aizId,
            issuer: msg.sender,
            principal: params.principal,
            interestRate: params.interestRate,
            duration: params.duration,
            issuanceTimestamp: block.timestamp,
            maturityTimestamp: block.timestamp + params.duration,
            reputationStaked: params.reputationStaked,
            investor: address(0),
            repaymentAmount: repaymentAmount,
            isRepaid: false,
            isDefaulted: false
        });
        
        // Add to AIZ bonds list
        aizBonds[params.aizId].push(bondId);
        
        // Mint NFT
        _mint(msg.sender, bondId);
        
        emit BondIssued(
            bondId,
            params.aizId,
            params.principal,
            params.interestRate,
            params.duration,
            params.reputationStaked
        );
        
        return bondId;
    }
    
    /**
     * @dev Purchase a bond from an AIZ
     * @param bondId Bond ID
     */
    function purchaseBond(uint256 bondId) external nonReentrant {
        Bond storage bond = bonds[bondId];
        require(bond.bondId != 0, "Bond does not exist");
        require(bond.investor == address(0), "Bond already purchased");
        require(block.timestamp < bond.maturityTimestamp, "Bond has matured");
        require(!bond.isRepaid && !bond.isDefaulted, "Bond is closed");
        
        // Verify that the AIZ is still active
        require(aizRegistry.isAIZActive(bond.aizId), "AIZ is not active");
        
        // Transfer USDC from investor to contract
        require(usdcToken.transferFrom(msg.sender, address(this), bond.principal), "USDC transfer failed");
        
        // Calculate and transfer protocol fee
        uint256 feeAmount = (bond.principal * protocolFee) / 100;
        require(usdcToken.transfer(treasury, feeAmount), "Fee transfer failed");
        
        // Transfer principal to AIZ
        uint256 amountToAIZ = bond.principal - feeAmount;
        require(usdcToken.transfer(bond.issuer, amountToAIZ), "AIZ payment failed");
        
        // Update bond
        bond.investor = msg.sender;
        
        // Add to investor bonds list
        investorBonds[msg.sender].push(bondId);
        
        // Transfer NFT to investor
        _transfer(bond.issuer, msg.sender, bondId);
        
        emit BondPurchased(bondId, msg.sender, bond.principal);
    }
    
    /**
     * @dev Repay a bond (called by AIZ)
     * @param bondId Bond ID
     */
    function repayBond(uint256 bondId) external nonReentrant {
        Bond storage bond = bonds[bondId];
        require(bond.bondId != 0, "Bond does not exist");
        require(bond.investor != address(0), "Bond not purchased");
        require(msg.sender == bond.issuer, "Not bond issuer");
        require(!bond.isRepaid && !bond.isDefaulted, "Bond is closed");
        
        // Transfer repayment amount from AIZ to contract
        require(usdcToken.transferFrom(msg.sender, address(this), bond.repaymentAmount), "Repayment transfer failed");
        
        // Transfer repayment to investor
        require(usdcToken.transfer(bond.investor, bond.repaymentAmount), "Investor payment failed");
        
        // Return reputation to AIZ
        // This would require implementing a method in DynamicReputationProtocol
        // reputationProtocol.unstakeReputation(bond.aizId, bond.reputationStaked, "Bond repayment");
        
        // Update bond status
        bond.isRepaid = true;
        
        emit BondRepaid(bondId, bond.repaymentAmount, bond.reputationStaked);
    }
    
    /**
     * @dev Handle bond default (called after maturity if not repaid)
     * @param bondId Bond ID
     */
    function handleDefault(uint256 bondId) external nonReentrant {
        Bond storage bond = bonds[bondId];
        require(bond.bondId != 0, "Bond does not exist");
        require(bond.investor != address(0), "Bond not purchased");
        require(block.timestamp >= bond.maturityTimestamp, "Bond not yet matured");
        require(!bond.isRepaid && !bond.isDefaulted, "Bond is closed");
        
        // Mark bond as defaulted
        bond.isDefaulted = true;
        
        // Calculate compensation for investor (80% of principal)
        uint256 investorCompensation = (bond.principal * 80) / 100;
        
        // Transfer compensation from treasury to investor
        require(usdcToken.transfer(bond.investor, investorCompensation), "Investor compensation failed");
        
        // Burn the staked reputation (penalize the AIZ)
        // This would require implementing a method in DynamicReputationProtocol
        // reputationProtocol.penalizeAIZ(bond.aizId, "Bond default", bond.reputationStaked);
        
        // Transfer remaining funds to treasury
        uint256 remainingFunds = bond.principal - investorCompensation;
        if (remainingFunds > 0) {
            require(usdcToken.transfer(treasury, remainingFunds), "Treasury transfer failed");
        }
        
        emit BondDefaulted(bondId, investorCompensation, bond.reputationStaked);
    }
    
    /**
     * @dev Get bond information
     * @param bondId Bond ID
     * @return Bond Bond information
     */
    function getBond(uint256 bondId) external view returns (Bond memory) {
        return bonds[bondId];
    }
    
    /**
     * @dev Get all bonds issued by an AIZ
     * @param aizId AIZ ID
     * @return uint256[] Array of bond IDs
     */
    function getAIZBonds(bytes32 aizId) external view returns (uint256[] memory) {
        return aizBonds[aizId];
    }
    
    /**
     * @dev Get all bonds owned by an investor
     * @param investor Investor address
     * @return uint256[] Array of bond IDs
     */
    function getInvestorBonds(address investor) external view returns (uint256[] memory) {
        return investorBonds[investor];
    }
    
    /**
     * @dev Get URI for a bond token
     * @param bondId Bond ID
     * @return string Token URI
     */
    function tokenURI(uint256 bondId) public view override returns (string memory) {
        Bond storage bond = bonds[bondId];
        if (bond.bondId == 0) {
            return "";
        }
        
        AIZRegistry.AIZInfo memory aizInfo = aizRegistry.getAIZ(bond.aizId);
        
        // Construct JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"',
            aizInfo.name,
            ' Reputation Bond #',
            bondId.toString(),
            '","description":"Reputation bond issued by ',
            aizInfo.name,
            ' with ',
            bond.reputationStaked.toString(),
            ' reputation points staked","aiz_name":"',
            aizInfo.name,
            '","principal":',
            bond.principal.toString(),
            ',"interest_rate":"',
            (bond.interestRate / 100).toString(),
            '%","duration_days":',
            (bond.duration / (24 * 60 * 60)).toString(),
            ',"reputation_staked":',
            bond.reputationStaked.toString(),
            ',"issuance_timestamp":',
            bond.issuanceTimestamp.toString(),
            ',"maturity_timestamp":',
            bond.maturityTimestamp.toString(),
            ',"repayment_amount":',
            bond.repaymentAmount.toString(),
            ',"status":"',
            bond.isRepaid ? "Repaid" : (bond.isDefaulted ? "Defaulted" : (block.timestamp >= bond.maturityTimestamp ? "Matured" : "Active")),
            '"}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }
    
    /**
     * @dev Set protocol fee percentage
     * @param newFee New fee percentage (0-20)
     */
    function setProtocolFee(uint256 newFee) external onlyOwner {
        require(newFee <= 20, "Fee too high"); // Max 20%
        uint256 oldFee = protocolFee;
        protocolFee = newFee;
        emit ProtocolFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Set treasury address
     * @param _treasury New treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
    
    /**
     * @dev Withdraw any accidentally sent ETH
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Withdraw ERC20 tokens (in case of accidental transfers)
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "Token transfer failed");
    }
}

// Base64 encoding library
library Base64 {
    bytes private constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        // Load the table into memory
        bytes memory table = TABLE;

        // Allocate memory for encoded data
        bytes memory encoded = new bytes(4 * ((data.length + 2) / 3));

        // Convert 3-byte chunks into 4-byte chunks
        for (uint256 i = 0; i < data.length; i += 3) {
            uint256 chunk;
            uint256 chunkSize = data.length - i < 3 ? data.length - i : 3;
            
            // Load 3 bytes into a 24-bit chunk
            assembly {
                chunk := mload(add(data, add(0x20, i)))
                chunk := shr(sub(256, mul(chunkSize, 8)), chunk)
            }
            
            // Convert to 4 base64 characters
            encoded[i * 4 / 3] = table[(chunk >> 18) & 0x3F];
            encoded[i * 4 / 3 + 1] = table[(chunk >> 12) & 0x3F];
            encoded[i * 4 / 3 + 2] = chunkSize > 1 ? table[(chunk >> 6) & 0x3F] : bytes1(uint8(61)); // '='
            encoded[i * 4 / 3 + 3] = chunkSize > 2 ? table[chunk & 0x3F] : bytes1(uint8(61)); // '='
        }
        
        return string(encoded);
    }
}