// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ClawNamehash.sol";

/// @title ClawResolver
/// @notice Stores address and text records for .claw domains
/// @dev Access-controlled via ClawRegistry ownership / approval
interface IClawRegistry {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

contract ClawResolver is Ownable {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice The ClawRegistry contract for ownership checks
    IClawRegistry public registry;

    /// @notice ETH address records: node => address
    mapping(bytes32 => address) private _addrs;

    /// @notice Text records: node => key => value
    mapping(bytes32 => mapping(string => string)) private _texts;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event AddrChanged(bytes32 indexed node, address addr);
    event TextChanged(bytes32 indexed node, string key, string value);

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(address initialOwner, address registryAddr)
        Ownable(initialOwner)
    {
        registry = IClawRegistry(registryAddr);
    }

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    /// @dev Only the domain owner or an approved operator can modify records
    modifier onlyAuthorized(bytes32 node) {
        require(_isAuthorized(node, msg.sender), "ClawResolver: not authorized");
        _;
    }

    // -------------------------------------------------------------------------
    // Address records
    // -------------------------------------------------------------------------

    /// @notice Set the ETH address record for a domain
    /// @param node The namehash of the domain
    /// @param newAddr The ETH address to set
    function setAddr(bytes32 node, address newAddr) external onlyAuthorized(node) {
        _addrs[node] = newAddr;
        emit AddrChanged(node, newAddr);
    }

    /// @notice Get the ETH address record for a domain
    /// @param node The namehash of the domain
    /// @return The ETH address
    function addr(bytes32 node) external view returns (address) {
        return _addrs[node];
    }

    // -------------------------------------------------------------------------
    // Text records
    // -------------------------------------------------------------------------

    /// @notice Set a text record for a domain
    /// @param node The namehash of the domain
    /// @param key The text record key (e.g. "avatar", "url", "email", "twitter", "github", "description")
    /// @param value The text record value
    function setText(bytes32 node, string calldata key, string calldata value)
        external
        onlyAuthorized(node)
    {
        _texts[node][key] = value;
        emit TextChanged(node, key, value);
    }

    /// @notice Get a text record for a domain
    /// @param node The namehash of the domain
    /// @param key The text record key
    /// @return The text record value
    function text(bytes32 node, string calldata key)
        external
        view
        returns (string memory)
    {
        return _texts[node][key];
    }

    // -------------------------------------------------------------------------
    // Admin
    // -------------------------------------------------------------------------

    /// @notice Update the registry address
    /// @param newRegistry The new registry address
    function setRegistry(address newRegistry) external onlyOwner {
        registry = IClawRegistry(newRegistry);
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    /// @dev Check if `caller` is authorized to modify records for `node`
    function _isAuthorized(bytes32 node, address caller) internal view returns (bool) {
        uint256 tokenId = uint256(node);
        address domainOwner;
        try registry.ownerOf(tokenId) returns (address o) {
            domainOwner = o;
        } catch {
            return false;
        }
        if (domainOwner == address(0)) return false;
        if (caller == domainOwner) return true;
        try registry.getApproved(tokenId) returns (address approved) {
            if (caller == approved) return true;
        } catch {}
        try registry.isApprovedForAll(domainOwner, caller) returns (bool approved) {
            if (approved) return true;
        } catch {}
        return false;
    }
}
