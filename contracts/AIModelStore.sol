// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ZXTToken.sol";

/**
 * @title AIModelStore
 * @dev NFT-based marketplace for AI models developed by EvolutionAIZ
 * Allows licensing of AI models through ERC1155 tokens with different license tiers
 */
contract AIModelStore is ERC1155, Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    // Structure to hold AI model metadata
    struct AIModel {
        uint256 modelId;
        string name;
        string description;
        string modelURI; // IPFS URI to model files/documentation
        address creator;
        uint256 creationTimestamp;
        uint256 basePrice; // Base price in ZXT tokens
        bool isActive;
    }
    
    // Structure to hold license types
    struct LicenseType {
        uint256 licenseId;
        string name;
        string description;
        uint256 priceMultiplier; // Multiplier of base price (e.g., 100 = 1x, 150 = 1.5x)
        uint256 maxLicenses; // Maximum number of licenses (0 for unlimited)
        uint256 duration; // License duration in seconds (0 for perpetual)
        bool isExclusive; // Whether this license is exclusive
    }
    
    // Structure to hold active licenses
    struct License {
        uint256 modelId;
        uint256 licenseTypeId;
        address licensee;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }
    
    // Reference to ZXT Token
    ZXTToken public zxtToken;
    
    // Treasury address for protocol fees
    address public treasury;
    
    // Model and license storage
    mapping(uint256 => AIModel) public models;
    mapping(uint256 => LicenseType) public licenseTypes;
    mapping(uint256 => mapping(uint256 => uint256)) public licenseSupply; // modelId => licenseTypeId => count
    mapping(uint256 => License) public licenses; // licenseId => License
    mapping(address => mapping(uint256 => bool)) public userLicensedModels; // user => modelId => hasLicense
    
    // Counters
    uint256 public modelCount;
    uint256 public licenseTypeCount;
    uint256 public licenseCount;
    
    // Protocol fee (percentage)
    uint256 public protocolFee = 10; // 10% protocol fee
    
    // Events
    event ModelCreated(
        uint256 indexed modelId,
        string name,
        address indexed creator,
        uint256 basePrice
    );
    
    event LicenseTypeCreated(
        uint256 indexed licenseTypeId,
        string name,
        uint256 priceMultiplier
    );
    
    event ModelListed(
        uint256 indexed modelId,
        bool isActive
    );
    
    event LicensePurchased(
        uint256 indexed licenseId,
        uint256 indexed modelId,
        uint256 indexed licenseTypeId,
        address licensee,
        uint256 pricePaid
    );
    
    event ModelPriceUpdated(
        uint256 indexed modelId,
        uint256 newBasePrice
    );
    
    event ProtocolFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );
    
    constructor(address _zxtToken, address _treasury) ERC1155("") {
        zxtToken = ZXTToken(_zxtToken);
        treasury = _treasury;
        
        // Create default license types
        createLicenseType("Standard", "Standard non-exclusive license", 100, 0, 0, false); // 1x price
        createLicenseType("Premium", "Premium non-exclusive license with extended usage", 150, 0, 31536000, false); // 1.5x price, 1 year
        createLicenseType("Exclusive", "Exclusive license for 1 month", 500, 1, 2592000, true); // 5x price, 1 license, 1 month
    }
    
    /**
     * @dev Create a new AI model NFT
     * @param name Model name
     * @param description Model description
     * @param modelURI IPFS URI to model files
     * @param basePrice Base price in ZXT tokens
     * @return uint256 Model ID
     */
    function createModel(
        string memory name,
        string memory description,
        string memory modelURI,
        uint256 basePrice
    ) external returns (uint256) {
        modelCount++;
        uint256 modelId = modelCount;
        
        models[modelId] = AIModel({
            modelId: modelId,
            name: name,
            description: description,
            modelURI: modelURI,
            creator: msg.sender,
            creationTimestamp: block.timestamp,
            basePrice: basePrice,
            isActive: true
        });
        
        emit ModelCreated(modelId, name, msg.sender, basePrice);
        
        return modelId;
    }
    
    /**
     * @dev Create a new license type
     * @param name License type name
     * @param description License type description
     * @param priceMultiplier Price multiplier (100 = 1x, 150 = 1.5x, etc.)
     * @param maxLicenses Maximum number of licenses (0 for unlimited)
     * @param duration License duration in seconds (0 for perpetual)
     * @param isExclusive Whether this license is exclusive
     * @return uint256 License type ID
     */
    function createLicenseType(
        string memory name,
        string memory description,
        uint256 priceMultiplier,
        uint256 maxLicenses,
        uint256 duration,
        bool isExclusive
    ) public onlyOwner returns (uint256) {
        licenseTypeCount++;
        uint256 licenseTypeId = licenseTypeCount;
        
        licenseTypes[licenseTypeId] = LicenseType({
            licenseId: licenseTypeId,
            name: name,
            description: description,
            priceMultiplier: priceMultiplier,
            maxLicenses: maxLicenses,
            duration: duration,
            isExclusive: isExclusive
        });
        
        emit LicenseTypeCreated(licenseTypeId, name, priceMultiplier);
        
        return licenseTypeId;
    }
    
    /**
     * @dev List or delist a model
     * @param modelId Model ID
     * @param active Whether to list (true) or delist (false) the model
     */
    function listModel(uint256 modelId, bool active) external {
        AIModel storage model = models[modelId];
        require(model.modelId != 0, "Model does not exist");
        require(msg.sender == model.creator || msg.sender == owner(), "Not authorized");
        
        model.isActive = active;
        emit ModelListed(modelId, active);
    }
    
    /**
     * @dev Update model base price
     * @param modelId Model ID
     * @param newBasePrice New base price in ZXT tokens
     */
    function updateModelPrice(uint256 modelId, uint256 newBasePrice) external {
        AIModel storage model = models[modelId];
        require(model.modelId != 0, "Model does not exist");
        require(msg.sender == model.creator, "Not model creator");
        
        model.basePrice = newBasePrice;
        emit ModelPriceUpdated(modelId, newBasePrice);
    }
    
    /**
     * @dev Purchase a license for an AI model
     * @param modelId Model ID
     * @param licenseTypeId License type ID
     * @return uint256 License ID
     */
    function purchaseLicense(uint256 modelId, uint256 licenseTypeId) external nonReentrant returns (uint256) {
        AIModel storage model = models[modelId];
        LicenseType storage licenseType = licenseTypes[licenseTypeId];
        
        // Validate model and license type
        require(model.modelId != 0, "Model does not exist");
        require(model.isActive, "Model not active");
        require(licenseType.licenseId != 0, "License type does not exist");
        
        // Check license supply limits
        if (licenseType.maxLicenses > 0) {
            require(licenseSupply[modelId][licenseTypeId] < licenseType.maxLicenses, "License limit reached");
        }
        
        // Calculate price
        uint256 price = (model.basePrice * licenseType.priceMultiplier) / 100;
        require(price > 0, "Invalid price");
        
        // Check if user already has a license for this model
        require(!userLicensedModels[msg.sender][modelId], "Already licensed this model");
        
        // Transfer ZXT tokens from buyer to contract
        require(zxtToken.transferFrom(msg.sender, address(this), price), "Payment failed");
        
        // Calculate protocol fee and creator payment
        uint256 feeAmount = (price * protocolFee) / 100;
        uint256 creatorAmount = price - feeAmount;
        
        // Transfer fee to treasury
        require(zxtToken.transfer(treasury, feeAmount), "Fee transfer failed");
        
        // Transfer payment to creator
        require(zxtToken.transfer(model.creator, creatorAmount), "Creator payment failed");
        
        // Create license
        licenseCount++;
        uint256 licenseId = licenseCount;
        
        uint256 endTime = licenseType.duration > 0 ? block.timestamp + licenseType.duration : 0;
        
        licenses[licenseId] = License({
            modelId: modelId,
            licenseTypeId: licenseTypeId,
            licensee: msg.sender,
            startTime: block.timestamp,
            endTime: endTime,
            isActive: true
        });
        
        // Update license supply
        licenseSupply[modelId][licenseTypeId]++;
        
        // Mark user as having license for this model
        userLicensedModels[msg.sender][modelId] = true;
        
        // Mint ERC1155 token
        _mint(msg.sender, licenseId, 1, "");
        
        emit LicensePurchased(licenseId, modelId, licenseTypeId, msg.sender, price);
        
        return licenseId;
    }
    
    /**
     * @dev Check if a license is valid
     * @param licenseId License ID
     * @return bool Whether the license is valid
     */
    function isLicenseValid(uint256 licenseId) public view returns (bool) {
        License storage license = licenses[licenseId];
        if (license.licenseId == 0 || !license.isActive) {
            return false;
        }
        
        // Check if license has expired
        if (license.endTime > 0 && block.timestamp > license.endTime) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Revoke a license (only creator or owner)
     * @param licenseId License ID
     */
    function revokeLicense(uint256 licenseId) external {
        License storage license = licenses[licenseId];
        require(license.licenseId != 0, "License does not exist");
        
        AIModel storage model = models[license.modelId];
        require(msg.sender == model.creator || msg.sender == owner(), "Not authorized");
        
        license.isActive = false;
        
        // Burn ERC1155 token
        _burn(license.licensee, licenseId, 1);
    }
    
    /**
     * @dev Get model information
     * @param modelId Model ID
     * @return AIModel Model information
     */
    function getModel(uint256 modelId) external view returns (AIModel memory) {
        return models[modelId];
    }
    
    /**
     * @dev Get license type information
     * @param licenseTypeId License type ID
     * @return LicenseType License type information
     */
    function getLicenseType(uint256 licenseTypeId) external view returns (LicenseType memory) {
        return licenseTypes[licenseTypeId];
    }
    
    /**
     * @dev Get license information
     * @param licenseId License ID
     * @return License License information
     */
    function getLicense(uint256 licenseId) external view returns (License memory) {
        return licenses[licenseId];
    }
    
    /**
     * @dev Get URI for a license token
     * @param licenseId License ID
     * @return string Token URI
     */
    function uri(uint256 licenseId) public view override returns (string memory) {
        License storage license = licenses[licenseId];
        if (license.licenseId == 0) {
            return "";
        }
        
        AIModel storage model = models[license.modelId];
        LicenseType storage licenseType = licenseTypes[license.licenseTypeId];
        
        // Construct JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name":"',
            model.name,
            ' - ',
            licenseType.name,
            ' License","description":"',
            licenseType.description,
            '","model":"',
            model.name,
            '","license_type":"',
            licenseType.name,
            '","creator":"',
            Strings.toHexString(uint160(model.creator), 20),
            '","valid_from":',
            Strings.toString(license.startTime),
            ',"valid_to":',
            license.endTime > 0 ? Strings.toString(license.endTime) : '"never"',
            ',"is_valid":',
            isLicenseValid(licenseId) ? "true" : "false",
            ',"model_uri":"',
            model.modelURI,
            '"}'
        ));
        
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }
    
    /**
     * @dev Set protocol fee percentage
     * @param newFee New fee percentage (0-100)
     */
    function setProtocolFee(uint256 newFee) external onlyOwner {
        require(newFee <= 50, "Fee too high"); // Max 50%
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