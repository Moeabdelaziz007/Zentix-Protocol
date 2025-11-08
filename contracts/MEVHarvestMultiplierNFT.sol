// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MEVHarvestMultiplierNFT
 * @dev Dynamic NFTs representing bonds that entitle holders to a share of MEV harvesting profits
 * These "Harvest Bonds" allow community members to directly participate in MEV profits
 */
contract MEVHarvestMultiplierNFT is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _tokenIds;
    
    // Structure to hold dynamic metadata for each Harvest Bond
    struct HarvestBondMetadata {
        string name;
        string description;
        uint256 issuanceDate;
        uint256 maturityDate;
        uint256 profitSharePercentage; // Percentage of MEV profits (e.g., 25 = 25%)
        uint256 totalProfitAccrued; // Total profit distributed to this bond
        uint256 dailyProfitAccrued; // Profit accrued in the last 24 hours
        string visualState; // Visual representation state (e.g., "glowing", "dim", "bright")
        string offchainDataURI; // URI to off-chain JSON metadata with dynamic visuals
        uint256 lastUpdated;
    }
    
    // Structure for bond issuance parameters
    struct BondIssuanceParams {
        uint256 totalBondsToIssue;
        uint256 bondPrice; // Price in wei to purchase each bond
        uint256 maturityPeriod; // Duration in seconds (e.g., 30 days = 2592000 seconds)
        uint256 profitSharePercentage; // Percentage of MEV profits to share with bond holders
    }
    
    // Addresses
    address public mevHarvesterAddress;
    address public treasuryAddress;
    
    // Events
    event MEVHarvesterAddressUpdated(address indexed oldAddress, address indexed newAddress);
    
    // Bond parameters
    BondIssuanceParams public currentBondParams;
    bool public bondSaleActive;
    uint256 public totalProfitDistributed;
    
    // Mapping from token ID to metadata
    mapping(uint256 => HarvestBondMetadata) public harvestBonds;
    
    // Mapping from token ID to owner's claimed profits
    mapping(uint256 => uint256) public claimedProfits;
    
    // Events
    event HarvestBondCreated(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 pricePaid
    );
    
    event HarvestBondUpdated(
        uint256 indexed tokenId,
        uint256 newTotalProfitAccrued,
        uint256 newDailyProfitAccrued,
        string newVisualState
    );
    
    event ProfitDistributed(
        uint256 totalProfit,
        uint256 distributedToBondHolders
    );
    
    event ProfitClaimed(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 amount
    );
    
    event BondSaleActivated(
        uint256 totalBonds,
        uint256 bondPrice,
        uint256 maturityPeriod,
        uint256 profitSharePercentage
    );
    
    event BondSaleDeactivated();
    
    constructor(
        address _mevHarvesterAddress,
        address _treasuryAddress
    ) ERC721("Zentix MEV Harvest Bond", "ZMHB") {
        mevHarvesterAddress = _mevHarvesterAddress;
        treasuryAddress = _treasuryAddress;
        bondSaleActive = false;
    }
    
    /**
     * @dev Set the MEV Harvester address (can only be called once)
     * @param _mevHarvesterAddress The address of the MEV Harvester contract
     */
    function setMEVHarvesterAddress(address _mevHarvesterAddress) external onlyOwner {
        require(mevHarvesterAddress == address(0), "MEV Harvester address already set");
        require(_mevHarvesterAddress != address(0), "MEV Harvester address cannot be zero");
        
        address oldAddress = mevHarvesterAddress;
        mevHarvesterAddress = _mevHarvesterAddress;
        
        emit MEVHarvesterAddressUpdated(oldAddress, _mevHarvesterAddress);
    }
    
    /**
     * @dev Create a new bond issuance for sale
     * @param params Bond issuance parameters
     */
    function createBondIssuance(BondIssuanceParams memory params) external onlyOwner {
        require(params.totalBondsToIssue > 0, "Must issue at least one bond");
        require(params.bondPrice > 0, "Bond price must be greater than zero");
        require(params.maturityPeriod > 0, "Maturity period must be greater than zero");
        require(params.profitSharePercentage > 0 && params.profitSharePercentage <= 100, "Profit share must be 1-100%");
        
        currentBondParams = params;
        bondSaleActive = true;
        
        emit BondSaleActivated(
            params.totalBondsToIssue,
            params.bondPrice,
            params.maturityPeriod,
            params.profitSharePercentage
        );
    }
    
    /**
     * @dev Purchase a harvest bond
     * @return The token ID of the newly created bond
     */
    function purchaseHarvestBond() external payable nonReentrant returns (uint256) {
        require(bondSaleActive, "Bond sale is not active");
        require(msg.value >= currentBondParams.bondPrice, "Insufficient payment");
        require(_tokenIds.current() < currentBondParams.totalBondsToIssue, "All bonds have been issued");
        
        // Send payment to treasury
        (bool sent, ) = treasuryAddress.call{value: msg.value}("");
        require(sent, "Failed to send payment to treasury");
        
        // Increment token ID counter
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Mint the NFT to the buyer
        _safeMint(msg.sender, newTokenId);
        
        // Set the metadata
        uint256 issuanceDate = block.timestamp;
        uint256 maturityDate = issuanceDate + currentBondParams.maturityPeriod;
        
        harvestBonds[newTokenId] = HarvestBondMetadata({
            name: string(abi.encodePacked("MEV Harvest Bond #", newTokenId.toString())),
            description: string(abi.encodePacked(
                "Entitles holder to ", 
                currentBondParams.profitSharePercentage.toString(), 
                "% of MEV harvesting profits for ", 
                (currentBondParams.maturityPeriod / 86400).toString(), 
                " days"
            )),
            issuanceDate: issuanceDate,
            maturityDate: maturityDate,
            profitSharePercentage: currentBondParams.profitSharePercentage,
            totalProfitAccrued: 0,
            dailyProfitAccrued: 0,
            visualState: "new", // Initial visual state
            offchainDataURI: "", // Will be set by off-chain service
            lastUpdated: block.timestamp
        });
        
        emit HarvestBondCreated(newTokenId, msg.sender, msg.value);
        
        // If all bonds are issued, deactivate sale
        if (_tokenIds.current() >= currentBondParams.totalBondsToIssue) {
            bondSaleActive = false;
            emit BondSaleDeactivated();
        }
        
        return newTokenId;
    }
    
    /**
     * @dev Distribute MEV profits to bond holders
     * This function would be called by the MEV Harvester contract
     * @param totalProfit Total MEV profit to distribute
     */
    function distributeMEVProfits(uint256 totalProfit) external nonReentrant {
        require(msg.sender == mevHarvesterAddress, "Only MEV Harvester can distribute profits");
        require(totalProfit > 0, "Profit must be greater than zero");
        
        uint256 distributedToBondHolders = (totalProfit * currentBondParams.profitSharePercentage) / 100;
        require(distributedToBondHolders > 0, "No profit to distribute to bond holders");
        
        // Update total profit distributed
        totalProfitDistributed += distributedToBondHolders;
        
        // Distribute profits equally among all active bonds
        uint256 totalBonds = _tokenIds.current();
        if (totalBonds > 0) {
            uint256 profitPerBond = distributedToBondHolders / totalBonds;
            
            // Update each bond's metadata
            for (uint256 i = 1; i <= totalBonds; i++) {
                if (_exists(i)) {
                    HarvestBondMetadata storage bond = harvestBonds[i];
                    
                    // Update profit tracking
                    bond.totalProfitAccrued += profitPerBond;
                    bond.dailyProfitAccrued += profitPerBond;
                    bond.lastUpdated = block.timestamp;
                    
                    // Update visual state based on profit
                    if (bond.dailyProfitAccrued > 1000000000000000000) { // > 1 ETH
                        bond.visualState = "bright";
                    } else if (bond.dailyProfitAccrued > 100000000000000000) { // > 0.1 ETH
                        bond.visualState = "glowing";
                    } else {
                        bond.visualState = "dim";
                    }
                    
                    emit HarvestBondUpdated(
                        i,
                        bond.totalProfitAccrued,
                        bond.dailyProfitAccrued,
                        bond.visualState
                    );
                }
            }
        }
        
        emit ProfitDistributed(totalProfit, distributedToBondHolders);
    }
    
    /**
     * @dev Claim accrued profits from a bond
     * @param tokenId The token ID of the bond
     */
    function claimProfits(uint256 tokenId) external nonReentrant {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only bond owner can claim profits");
        
        HarvestBondMetadata storage bond = harvestBonds[tokenId];
        uint256 unclaimedProfit = bond.totalProfitAccrued - claimedProfits[tokenId];
        
        require(unclaimedProfit > 0, "No unclaimed profits");
        
        // Update claimed profits
        claimedProfits[tokenId] = bond.totalProfitAccrued;
        
        // Transfer profits to bond owner
        (bool sent, ) = msg.sender.call{value: unclaimedProfit}("");
        require(sent, "Failed to send profits to bond owner");
        
        emit ProfitClaimed(tokenId, msg.sender, unclaimedProfit);
    }
    
    /**
     * @dev Get the metadata of a Harvest Bond
     * @param tokenId The token ID
     * @return The metadata
     */
    function getHarvestBond(uint256 tokenId) external view returns (HarvestBondMetadata memory) {
        return harvestBonds[tokenId];
    }
    
    /**
     * @dev Get unclaimed profits for a bond
     * @param tokenId The token ID
     * @return Unclaimed profit amount
     */
    function getUnclaimedProfits(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        HarvestBondMetadata storage bond = harvestBonds[tokenId];
        return bond.totalProfitAccrued - claimedProfits[tokenId];
    }
    
    /**
     * @dev Reset daily profit counters (to be called once per day)
     */
    function resetDailyProfits() external onlyOwner {
        uint256 totalBonds = _tokenIds.current();
        for (uint256 i = 1; i <= totalBonds; i++) {
            if (_exists(i)) {
                harvestBonds[i].dailyProfitAccrued = 0;
            }
        }
    }
    
    /**
     * @dev Set off-chain metadata URI for a bond
     * @param tokenId The token ID
     * @param uri The URI to the off-chain metadata
     */
    function setOffchainMetadataURI(uint256 tokenId, string memory uri) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        harvestBonds[tokenId].offchainDataURI = uri;
    }
    
    /**
     * @dev Deactivate bond sale
     */
    function deactivateBondSale() external onlyOwner {
        bondSaleActive = false;
        emit BondSaleDeactivated();
    }
    
    /**
     * @dev Withdraw any accidentally sent ETH
     */
    function withdraw() external onlyOwner {
        (bool sent, ) = owner().call{value: address(this).balance}("");
        require(sent, "Failed to withdraw ETH");
    }
    
    /**
     * @dev Hook that is called before any token transfer
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
    
    /**
     * @dev Required to receive ETH from MEV Harvester
     */
    receive() external payable {}
}