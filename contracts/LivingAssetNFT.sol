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

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title LivingAssetNFT
 * @dev Dynamic NFT representing AI-managed assets with real-time performance data
 * These "Living Assets" represent ZSMAS vaults that can be traded on NFT markets
 */
contract LivingAssetNFT is ERC721, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Structure to hold dynamic metadata for each iNFT
    struct LivingAssetMetadata {
        string name;
        string description;
        string strategyName;
        uint256 currentAllocation; // Percentage of assets allocated
        uint256 riskScore; // 1-100 scale
        uint256 thirtyDayPerformance; // Percentage return
        uint256 totalValue; // Total value in USD
        string offchainDataURI; // URI to off-chain JSON metadata
        uint256 lastUpdated;
    }
    
    // Mapping from token ID to metadata
    mapping(uint256 => LivingAssetMetadata) public livingAssets;
    
    // Mapping from user DID to token ID (one vault per user)
    mapping(string => uint256) public userVaults;
    
    // Royalty information
    uint256 public constant ROYALTY_PERCENTAGE = 5; // 5% royalty on secondary sales
    address public treasury; // Treasury address to receive royalties
    
    // Events
    event LivingAssetCreated(
        uint256 indexed tokenId,
        string userDid,
        uint256 totalValue,
        uint256 riskScore
    );
    
    event LivingAssetUpdated(
        uint256 indexed tokenId,
        uint256 newTotalValue,
        uint256 newRiskScore,
        uint256 newPerformance
    );
    
    event RoyaltyPaid(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed receiver,
        uint256 amount
    );

    constructor(address _treasury) 
        ERC721("Zentix Living Asset", "ZLA") {
        treasury = _treasury;
    }

    /**
     * @dev Create a new Living Asset NFT for a user's ZSMAS vault
     * @param userDid The user's DID
     * @param name The name of the asset
     * @param description Description of the asset
     * @param initialMetadata Initial metadata for the asset
     * @return The token ID of the newly created NFT
     */
    function createLivingAsset(
        string memory userDid,
        string memory name,
        string memory description,
        LivingAssetMetadata memory initialMetadata
    ) external onlyOwner returns (uint256) {
        require(userVaults[userDid] == 0, "User already has a vault NFT");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Mint the NFT to the owner (will be transferred to user)
        _safeMint(owner(), newTokenId);
        
        // Set the metadata
        livingAssets[newTokenId] = LivingAssetMetadata({
            name: name,
            description: description,
            strategyName: initialMetadata.strategyName,
            currentAllocation: initialMetadata.currentAllocation,
            riskScore: initialMetadata.riskScore,
            thirtyDayPerformance: initialMetadata.thirtyDayPerformance,
            totalValue: initialMetadata.totalValue,
            offchainDataURI: initialMetadata.offchainDataURI,
            lastUpdated: block.timestamp
        });
        
        // Associate with user DID
        userVaults[userDid] = newTokenId;
        
        emit LivingAssetCreated(
            newTokenId,
            userDid,
            initialMetadata.totalValue,
            initialMetadata.riskScore
        );
        
        return newTokenId;
    }

    /**
     * @dev Update the metadata of a Living Asset
     * @param tokenId The token ID to update
     * @param newMetadata The new metadata
     */
    function updateLivingAsset(
        uint256 tokenId,
        LivingAssetMetadata memory newMetadata
    ) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        
        livingAssets[tokenId] = LivingAssetMetadata({
            name: newMetadata.name,
            description: newMetadata.description,
            strategyName: newMetadata.strategyName,
            currentAllocation: newMetadata.currentAllocation,
            riskScore: newMetadata.riskScore,
            thirtyDayPerformance: newMetadata.thirtyDayPerformance,
            totalValue: newMetadata.totalValue,
            offchainDataURI: newMetadata.offchainDataURI,
            lastUpdated: block.timestamp
        });
        
        emit LivingAssetUpdated(
            tokenId,
            newMetadata.totalValue,
            newMetadata.riskScore,
            newMetadata.thirtyDayPerformance
        );
    }

    /**
     * @dev Get the metadata of a Living Asset
     * @param tokenId The token ID
     * @return The metadata
     */
    function getLivingAsset(uint256 tokenId) external view returns (LivingAssetMetadata memory) {
        return livingAssets[tokenId];
    }

    /**
     * @dev Set the treasury address
     * @param _treasury The new treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    /**
     * @dev Override royalty info to enable secondary market royalties
     * @param tokenId The token ID
     * @param salePrice The sale price
     * @return receiver The receiver of the royalty
     * @return royaltyAmount The royalty amount
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        external view returns (address receiver, uint256 royaltyAmount) {
        receiver = treasury;
        royaltyAmount = (salePrice * ROYALTY_PERCENTAGE) / 100;
    }

    /**
     * @dev Hook that is called before any token transfer
     * @param from The address from which the token is being transferred
     * @param to The address to which the token is being transferred
     * @param tokenId The token ID
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable)
        returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}