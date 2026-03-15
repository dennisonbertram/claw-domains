// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "./ClawNamehash.sol";

/// @title ClawRegistry
/// @notice ERC721-based domain registry for .claw names on Arc Network
/// @dev Each token IS the domain. tokenId = uint256(namehash(label))
contract ClawRegistry is ERC721, Ownable {
    using ClawNamehash for string;
    using SafeERC20 for IERC20;

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    uint256 public constant REGISTRATION_DURATION = 365 days;

    // -------------------------------------------------------------------------
    // Immutables
    // -------------------------------------------------------------------------

    /// @notice USDC token contract
    IERC20 public immutable usdc;

    // -------------------------------------------------------------------------
    // Pricing (owner-configurable)
    // Index: 0 = 5+ chars, 1 = 4 chars, 2 = 3 chars, 3 = 1-2 chars
    // -------------------------------------------------------------------------

    uint256[4] public usdcPrices;

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice Expiry timestamp per tokenId
    mapping(uint256 => uint256) private _expiries;

    /// @notice Resolver address per tokenId
    mapping(uint256 => address) private _resolvers;

    /// @notice Name string per tokenId (for display / reverse lookup)
    mapping(uint256 => string) private _names;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event DomainRegistered(
        uint256 indexed tokenId,
        string name,
        address owner,
        uint256 expires
    );

    event DomainRenewed(uint256 indexed tokenId, uint256 newExpires);

    event ResolverSet(uint256 indexed tokenId, address resolver);

    event PricesUpdated(uint256[4] usdcPrices);

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(address initialOwner, address usdcToken)
        ERC721("Claw Domains", "CLAW")
        Ownable(initialOwner)
    {
        usdc = IERC20(usdcToken);

        // USDC has 6 decimals: $5 / $20 / $50 / $200
        usdcPrices = [uint256(5e6), 20e6, 50e6, 200e6];
    }

    // -------------------------------------------------------------------------
    // Public / External
    // -------------------------------------------------------------------------

    /// @notice Register a new .claw domain
    /// @param name The label to register (e.g. "alice" for "alice.claw")
    /// @param domainOwner The address that will own the domain NFT
    function register(string calldata name, address domainOwner) external {
        uint256 price = getUsdcPrice(name);
        usdc.safeTransferFrom(msg.sender, address(this), price);
        _register(name, domainOwner);
    }

    /// @notice Register a new .claw domain with USDC permit (single transaction)
    /// @param name The label to register (e.g. "alice" for "alice.claw")
    /// @param domainOwner The address that will own the domain NFT
    /// @param deadline Permit signature deadline
    /// @param v ECDSA v
    /// @param r ECDSA r
    /// @param s ECDSA s
    function registerWithPermit(
        string calldata name,
        address domainOwner,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        uint256 price = getUsdcPrice(name);
        try IERC20Permit(address(usdc)).permit(msg.sender, address(this), price, deadline, v, r, s) {} catch {}
        usdc.safeTransferFrom(msg.sender, address(this), price);
        _register(name, domainOwner);
    }

    /// @notice Check if a name is available for registration
    /// @param name The label to check
    /// @return True if available
    function available(string calldata name) external view returns (bool) {
        if (!ClawNamehash.isValidLabel(name)) return false;
        uint256 tokenId = ClawNamehash.labelToId(name);
        return _isAvailable(tokenId);
    }

    /// @notice Get the expiry timestamp for a domain
    /// @param tokenId The token ID (namehash)
    /// @return The expiry timestamp (0 if never registered)
    function nameExpires(uint256 tokenId) external view returns (uint256) {
        return _expiries[tokenId];
    }

    /// @notice Renew a domain for 1 more year
    /// @param tokenId The token ID to renew
    function renew(uint256 tokenId) external {
        string memory name = _names[tokenId];
        uint256 price = getUsdcPrice(name);
        usdc.safeTransferFrom(msg.sender, address(this), price);
        _renew(tokenId);
    }

    /// @notice Renew a domain with USDC permit (single transaction)
    /// @param tokenId The token ID to renew
    /// @param deadline Permit signature deadline
    /// @param v ECDSA v
    /// @param r ECDSA r
    /// @param s ECDSA s
    function renewWithPermit(
        uint256 tokenId,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        string memory name = _names[tokenId];
        uint256 price = getUsdcPrice(name);
        try IERC20Permit(address(usdc)).permit(msg.sender, address(this), price, deadline, v, r, s) {} catch {}
        usdc.safeTransferFrom(msg.sender, address(this), price);
        _renew(tokenId);
    }

    /// @notice Set the resolver for a domain
    /// @param tokenId The token ID
    /// @param resolverAddr The resolver contract address
    function setResolver(uint256 tokenId, address resolverAddr) external {
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "ClawRegistry: not owner or approved"
        );
        _resolvers[tokenId] = resolverAddr;
        emit ResolverSet(tokenId, resolverAddr);
    }

    /// @notice Get the resolver for a domain
    /// @param tokenId The token ID
    /// @return The resolver address
    function resolver(uint256 tokenId) external view returns (address) {
        return _resolvers[tokenId];
    }

    /// @notice Get the name string for a token ID
    /// @param tokenId The token ID
    /// @return The domain label
    function getName(uint256 tokenId) external view returns (string memory) {
        return _names[tokenId];
    }

    /// @notice Update USDC price tiers (owner only)
    /// @param newUsdcPrices Array of 4 prices: [5+chars, 4chars, 3chars, 1-2chars]
    function setPrices(uint256[4] calldata newUsdcPrices) external onlyOwner {
        usdcPrices = newUsdcPrices;
        emit PricesUpdated(newUsdcPrices);
    }

    /// @notice Withdraw collected USDC fees to the contract owner
    function withdrawUsdc() external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "ClawRegistry: nothing to withdraw");
        usdc.safeTransfer(owner(), balance);
    }

    /// @notice Get the USDC registration price for a name
    /// @param name The domain label
    /// @return The price in USDC (6 decimals)
    function getUsdcPrice(string memory name) public view returns (uint256) {
        return usdcPrices[_priceIndex(bytes(name).length)];
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    /// @dev Core registration logic: validates label, handles expired domains, mints NFT
    function _register(string calldata name, address domainOwner) internal {
        require(ClawNamehash.isValidLabel(name), "ClawRegistry: invalid label");

        uint256 tokenId = ClawNamehash.labelToId(name);

        // If the token exists but has expired, burn it first
        if (_ownerOf(tokenId) != address(0)) {
            require(
                block.timestamp > _expiries[tokenId],
                "ClawRegistry: name not available"
            );
            _burn(tokenId);
        }

        uint256 expires = block.timestamp + REGISTRATION_DURATION;
        _expiries[tokenId] = expires;
        _names[tokenId] = name;

        _safeMint(domainOwner, tokenId);

        emit DomainRegistered(tokenId, name, domainOwner, expires);
    }

    /// @dev Core renewal logic: validates token exists and not expired, extends expiry
    function _renew(uint256 tokenId) internal {
        require(_ownerOf(tokenId) != address(0), "ClawRegistry: token does not exist");
        require(
            block.timestamp <= _expiries[tokenId],
            "ClawRegistry: domain has expired"
        );

        uint256 newExpires = _expiries[tokenId] + REGISTRATION_DURATION;
        _expiries[tokenId] = newExpires;

        emit DomainRenewed(tokenId, newExpires);
    }

    /// @dev Returns the pricing array index for a given label length
    function _priceIndex(uint256 len) private pure returns (uint256) {
        if (len <= 2) return 3;
        if (len == 3) return 2;
        if (len == 4) return 1;
        return 0;
    }

    function _isAvailable(uint256 tokenId) internal view returns (bool) {
        address owner_ = _ownerOf(tokenId);
        if (owner_ == address(0)) return true;
        return block.timestamp > _expiries[tokenId];
    }

    /// @dev Check if `spender` is the owner or approved for `tokenId`
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner_ = ownerOf(tokenId);
        return (
            spender == owner_ ||
            getApproved(tokenId) == spender ||
            isApprovedForAll(owner_, spender)
        );
    }

    // -------------------------------------------------------------------------
    // ERC721 overrides
    // -------------------------------------------------------------------------

    /// @dev Override to prevent transfer of expired domains
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        // Allow burning (to == address(0))
        // Allow minting (from == address(0))
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            // Transfer: check not expired
            require(
                block.timestamp <= _expiries[tokenId],
                "ClawRegistry: domain has expired"
            );
        }
        return super._update(to, tokenId, auth);
    }

    /// @dev Token URI returns a simple data URI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        string memory name_ = _names[tokenId];
        return string(abi.encodePacked("https://claw.domains/metadata/", name_));
    }
}
