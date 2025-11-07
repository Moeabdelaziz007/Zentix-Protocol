// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZentixRegistry
 * @dev On-chain registry for Zentix agent DIDs and IPFS anchors
 * Stores immutable records of agent identities and their evolution
 */
contract ZentixRegistry is Ownable {
    struct AnchorRecord {
        string did;
        string ipfsCid;
        uint256 timestamp;
        address creator;
        string anchorType; // "did", "wallet", "event", "history"
    }

    // Mapping: DID => array of anchor records
    mapping(string => AnchorRecord[]) public anchors;
    
    // All registered DIDs
    string[] public registeredDIDs;
    mapping(string => bool) public didExists;

    event DIDAnchored(
        string indexed did,
        string ipfsCid,
        string anchorType,
        address indexed creator,
        uint256 timestamp
    );

    event WalletLinked(
        string indexed did,
        address walletAddress,
        string ipfsCid
    );

    /**
     * @dev Register a DID with IPFS anchor
     * @param did Agent's decentralized identifier
     * @param ipfsCid IPFS content identifier
     * @param anchorType Type of anchor (did, wallet, event, history)
     */
    function anchorDID(
        string calldata did,
        string calldata ipfsCid,
        string calldata anchorType
    ) external {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(bytes(ipfsCid).length > 0, "IPFS CID cannot be empty");

        AnchorRecord memory record = AnchorRecord({
            did: did,
            ipfsCid: ipfsCid,
            timestamp: block.timestamp,
            creator: msg.sender,
            anchorType: anchorType
        });

        anchors[did].push(record);

        if (!didExists[did]) {
            registeredDIDs.push(did);
            didExists[did] = true;
        }

        emit DIDAnchored(did, ipfsCid, anchorType, msg.sender, block.timestamp);
    }

    /**
     * @dev Link wallet address to DID
     * @param did Agent's DID
     * @param walletAddress Wallet address
     * @param ipfsCid IPFS CID of wallet data
     */
    function linkWallet(
        string calldata did,
        address walletAddress,
        string calldata ipfsCid
    ) external {
        require(didExists[did], "DID not registered");
        emit WalletLinked(did, walletAddress, ipfsCid);
    }

    /**
     * @dev Get all anchors for a DID
     * @param did Agent's DID
     * @return Array of anchor records
     */
    function getAnchors(string calldata did)
        external
        view
        returns (AnchorRecord[] memory)
    {
        return anchors[did];
    }

    /**
     * @dev Get total number of registered DIDs
     * @return Count of DIDs
     */
    function getTotalDIDs() external view returns (uint256) {
        return registeredDIDs.length;
    }

    /**
     * @dev Get latest anchor for a DID
     * @param did Agent's DID
     * @return Latest anchor record
     */
    function getLatestAnchor(string calldata did)
        external
        view
        returns (AnchorRecord memory)
    {
        require(anchors[did].length > 0, "No anchors found");
        return anchors[did][anchors[did].length - 1];
    }

    /**
     * @dev Check if DID is registered
     * @param did Agent's DID
     * @return true if registered
     */
    function isDIDRegistered(string calldata did) external view returns (bool) {
        return didExists[did];
    }
}
