// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/ClawRegistry.sol";
import "../src/ClawResolver.sol";
import "../src/ClawNamehash.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Minimal mock USDC with 6 decimals and a public mint function
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) { return 6; }

    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract ClawDomainsTest is Test {
    ClawRegistry public registry;
    ClawResolver public resolver;
    MockUSDC      public mockUsdc;

    address public owner = address(0x1);
    address public alice = address(0x2);
    address public bob   = address(0x3);
    address public carol = address(0x4);

    // USDC price constants (match defaults in contract, 6 decimals)
    uint256 constant USDC_5PLUS = 5e6;    // $5
    uint256 constant USDC_4     = 20e6;   // $20
    uint256 constant USDC_3     = 50e6;   // $50
    uint256 constant USDC_12    = 200e6;  // $200

    function setUp() public {
        vm.startPrank(owner);
        mockUsdc  = new MockUSDC();
        registry  = new ClawRegistry(owner, address(mockUsdc));
        resolver  = new ClawResolver(owner, address(registry));
        vm.stopPrank();
    }

    // Helper: mint USDC to `to`, approve registry, then register as `to`
    function _mintApproveRegister(address to, string memory name, uint256 price) internal {
        mockUsdc.mint(to, price);
        vm.prank(to);
        mockUsdc.approve(address(registry), price);
        vm.prank(to);
        registry.register(name, to);
    }

    // Helper: mint USDC to `payer`, approve registry, register `name` owned by `domainOwner` as `payer`
    function _mintApproveRegisterFor(address payer, string memory name, address domainOwner, uint256 price) internal {
        mockUsdc.mint(payer, price);
        vm.prank(payer);
        mockUsdc.approve(address(registry), price);
        vm.prank(payer);
        registry.register(name, domainOwner);
    }

    // Helper: mint USDC to `payer`, approve registry, renew tokenId as `payer`
    function _mintApproveRenew(address payer, uint256 tokenId, uint256 price) internal {
        mockUsdc.mint(payer, price);
        vm.prank(payer);
        mockUsdc.approve(address(registry), price);
        vm.prank(payer);
        registry.renew(tokenId);
    }

    // =========================================================================
    // ClawNamehash library tests
    // =========================================================================

    function test_namehash_alice() public pure {
        bytes32 h = ClawNamehash.namehash("alice");
        assertNotEq(h, bytes32(0));
        assertEq(h, ClawNamehash.namehash("alice"));
    }

    function test_namehash_different_labels() public pure {
        bytes32 h1 = ClawNamehash.namehash("alice");
        bytes32 h2 = ClawNamehash.namehash("bob");
        assertNotEq(h1, h2);
    }

    function test_labelToId_consistency() public pure {
        uint256 id = ClawNamehash.labelToId("alice");
        assertEq(id, uint256(ClawNamehash.namehash("alice")));
    }

    function test_isValidLabel_valid() public pure {
        assertTrue(ClawNamehash.isValidLabel("alice"));
        assertTrue(ClawNamehash.isValidLabel("bob123"));
        assertTrue(ClawNamehash.isValidLabel("my-domain"));
        assertTrue(ClawNamehash.isValidLabel("a"));
        assertTrue(ClawNamehash.isValidLabel("1234567890"));
        assertTrue(ClawNamehash.isValidLabel("abc-def-ghi"));
    }

    function test_isValidLabel_invalid_uppercase() public pure {
        assertFalse(ClawNamehash.isValidLabel("Alice"));
        assertFalse(ClawNamehash.isValidLabel("ALICE"));
        assertFalse(ClawNamehash.isValidLabel("aLICE"));
    }

    function test_isValidLabel_invalid_leading_hyphen() public pure {
        assertFalse(ClawNamehash.isValidLabel("-alice"));
        assertFalse(ClawNamehash.isValidLabel("-"));
    }

    function test_isValidLabel_invalid_trailing_hyphen() public pure {
        assertFalse(ClawNamehash.isValidLabel("alice-"));
    }

    function test_isValidLabel_invalid_empty() public pure {
        assertFalse(ClawNamehash.isValidLabel(""));
    }

    function test_isValidLabel_invalid_special_chars() public pure {
        assertFalse(ClawNamehash.isValidLabel("alice.claw"));
        assertFalse(ClawNamehash.isValidLabel("alice bob"));
        assertFalse(ClawNamehash.isValidLabel("alice_bob"));
        assertFalse(ClawNamehash.isValidLabel("alice@bob"));
    }

    function test_isValidLabel_max_length() public pure {
        // 63 chars (valid)
        assertTrue(ClawNamehash.isValidLabel("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"));
        // 64 chars (invalid)
        assertFalse(ClawNamehash.isValidLabel("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"));
    }

    // =========================================================================
    // Registration tests (USDC)
    // =========================================================================

    function test_register_basic() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");
        assertEq(registry.ownerOf(tokenId), alice);
        assertTrue(registry.nameExpires(tokenId) > block.timestamp);
        assertFalse(registry.available("alice"));
    }

    function test_register_emits_event() public {
        uint256 tokenId = ClawNamehash.labelToId("alice");
        uint256 expectedExpiry = block.timestamp + 365 days;

        mockUsdc.mint(alice, USDC_5PLUS);
        vm.prank(alice);
        mockUsdc.approve(address(registry), USDC_5PLUS);

        vm.expectEmit(true, false, false, true);
        emit ClawRegistry.DomainRegistered(tokenId, "alice", alice, expectedExpiry);

        vm.prank(alice);
        registry.register("alice", alice);
    }

    function test_register_for_another_address() public {
        _mintApproveRegisterFor(alice, "bobdomain", bob, USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("bobdomain");
        assertEq(registry.ownerOf(tokenId), bob);
    }

    function test_register_fails_insufficient_allowance() public {
        mockUsdc.mint(alice, USDC_5PLUS);
        vm.prank(alice);
        mockUsdc.approve(address(registry), USDC_5PLUS - 1);

        vm.prank(alice);
        vm.expectRevert();
        registry.register("alice", alice);
    }

    function test_register_fails_invalid_label() public {
        mockUsdc.mint(alice, USDC_5PLUS);
        vm.prank(alice);
        mockUsdc.approve(address(registry), USDC_5PLUS);

        vm.prank(alice);
        vm.expectRevert("ClawRegistry: invalid label");
        registry.register("Alice", alice);
    }

    function test_register_fails_duplicate() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        mockUsdc.mint(bob, USDC_5PLUS);
        vm.prank(bob);
        mockUsdc.approve(address(registry), USDC_5PLUS);

        vm.prank(bob);
        vm.expectRevert("ClawRegistry: name not available");
        registry.register("alice", bob);
    }

    function test_register_after_expiry() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        vm.warp(block.timestamp + 366 days);

        assertTrue(registry.available("alice"));

        _mintApproveRegister(bob, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");
        assertEq(registry.ownerOf(tokenId), bob);
    }

    // =========================================================================
    // USDC pricing tests
    // =========================================================================

    function test_price_usdc_1char() public view {
        assertEq(registry.getUsdcPrice("a"), USDC_12);
    }

    function test_price_usdc_2char() public view {
        assertEq(registry.getUsdcPrice("ab"), USDC_12);
    }

    function test_price_usdc_3char() public view {
        assertEq(registry.getUsdcPrice("abc"), USDC_3);
    }

    function test_price_usdc_4char() public view {
        assertEq(registry.getUsdcPrice("abcd"), USDC_4);
    }

    function test_price_usdc_5char() public view {
        assertEq(registry.getUsdcPrice("abcde"), USDC_5PLUS);
    }

    function test_price_usdc_long_name() public view {
        assertEq(registry.getUsdcPrice("superlongdomainname"), USDC_5PLUS);
    }

    function test_register_1char_correct_price() public {
        _mintApproveRegister(alice, "a", USDC_12);
        assertEq(registry.ownerOf(ClawNamehash.labelToId("a")), alice);
    }

    function test_register_3char_correct_price() public {
        _mintApproveRegister(alice, "abc", USDC_3);
        assertEq(registry.ownerOf(ClawNamehash.labelToId("abc")), alice);
    }

    function test_register_4char_correct_price() public {
        _mintApproveRegister(alice, "abcd", USDC_4);
        assertEq(registry.ownerOf(ClawNamehash.labelToId("abcd")), alice);
    }

    function testRegisterWithUsdcCorrectTiers() public {
        // 1-char name ($200 USDC)
        _mintApproveRegister(alice, "a", USDC_12);
        assertEq(mockUsdc.balanceOf(address(registry)), USDC_12);

        // 3-char name ($50 USDC) -- separate user to avoid duplicate
        _mintApproveRegister(bob, "bcd", USDC_3);
    }

    // =========================================================================
    // Availability tests
    // =========================================================================

    function test_available_before_registration() public view {
        assertTrue(registry.available("alice"));
    }

    function test_available_after_registration() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);
        assertFalse(registry.available("alice"));
    }

    function test_available_after_expiry() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        vm.warp(block.timestamp + 366 days);
        assertTrue(registry.available("alice"));
    }

    function test_available_invalid_label() public view {
        assertFalse(registry.available("Alice"));
        assertFalse(registry.available("-invalid"));
    }

    // =========================================================================
    // Renewal tests (USDC)
    // =========================================================================

    function test_renew_extends_expiry() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");
        uint256 originalExpiry = registry.nameExpires(tokenId);

        _mintApproveRenew(bob, tokenId, USDC_5PLUS);

        assertEq(registry.nameExpires(tokenId), originalExpiry + 365 days);
    }

    function test_renew_emits_event() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");
        uint256 originalExpiry = registry.nameExpires(tokenId);

        mockUsdc.mint(bob, USDC_5PLUS);
        vm.prank(bob);
        mockUsdc.approve(address(registry), USDC_5PLUS);

        vm.expectEmit(true, false, false, true);
        emit ClawRegistry.DomainRenewed(tokenId, originalExpiry + 365 days);

        vm.prank(bob);
        registry.renew(tokenId);
    }

    function test_renew_fails_expired_domain() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");

        vm.warp(block.timestamp + 366 days);

        mockUsdc.mint(bob, USDC_5PLUS);
        vm.prank(bob);
        mockUsdc.approve(address(registry), USDC_5PLUS);

        vm.prank(bob);
        vm.expectRevert("ClawRegistry: domain has expired");
        registry.renew(tokenId);
    }

    function test_renew_fails_nonexistent_token() public {
        uint256 fakeTokenId = 12345;

        mockUsdc.mint(alice, USDC_5PLUS);
        vm.prank(alice);
        mockUsdc.approve(address(registry), USDC_5PLUS);

        vm.prank(alice);
        vm.expectRevert();
        registry.renew(fakeTokenId);
    }

    function testRenewUsdcInsufficientAllowance() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");

        mockUsdc.mint(bob, USDC_5PLUS);
        vm.prank(bob);
        mockUsdc.approve(address(registry), USDC_5PLUS - 1);

        vm.prank(bob);
        vm.expectRevert();
        registry.renew(tokenId);
    }

    // =========================================================================
    // setPrices tests
    // =========================================================================

    function testSetPrices() public {
        uint256[4] memory newUsdc = [uint256(10e6), 40e6, 100e6, 400e6];

        vm.prank(owner);
        registry.setPrices(newUsdc);

        assertEq(registry.getUsdcPrice("alice"),    10e6);       // 5+ chars
        assertEq(registry.getUsdcPrice("abcd"),     40e6);       // 4 chars
        assertEq(registry.getUsdcPrice("abc"),      100e6);      // 3 chars
        assertEq(registry.getUsdcPrice("ab"),       400e6);      // 1-2 chars
    }

    function testSetPricesEmitsEvent() public {
        uint256[4] memory newUsdc = [uint256(10e6), 40e6, 100e6, 400e6];

        vm.expectEmit(false, false, false, true);
        emit ClawRegistry.PricesUpdated(newUsdc);

        vm.prank(owner);
        registry.setPrices(newUsdc);
    }

    function testSetPricesNotOwner() public {
        uint256[4] memory newUsdc = [uint256(10e6), 40e6, 100e6, 400e6];

        vm.prank(alice);
        vm.expectRevert();
        registry.setPrices(newUsdc);
    }

    // =========================================================================
    // withdrawUsdc tests
    // =========================================================================

    function testWithdrawUsdc() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        assertEq(mockUsdc.balanceOf(address(registry)), USDC_5PLUS);

        uint256 ownerUsdcBefore = mockUsdc.balanceOf(owner);

        vm.prank(owner);
        registry.withdrawUsdc();

        assertEq(mockUsdc.balanceOf(address(registry)), 0);
        assertEq(mockUsdc.balanceOf(owner), ownerUsdcBefore + USDC_5PLUS);
    }

    function testWithdrawUsdcFailsNonOwner() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        vm.prank(alice);
        vm.expectRevert();
        registry.withdrawUsdc();
    }

    function testWithdrawUsdcFailsEmpty() public {
        vm.prank(owner);
        vm.expectRevert("ClawRegistry: nothing to withdraw");
        registry.withdrawUsdc();
    }

    // =========================================================================
    // Resolver tests
    // =========================================================================

    function test_setResolver() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");

        vm.prank(alice);
        registry.setResolver(tokenId, address(resolver));

        assertEq(registry.resolver(tokenId), address(resolver));
    }

    function test_setResolver_emits_event() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");

        vm.expectEmit(true, false, false, true);
        emit ClawRegistry.ResolverSet(tokenId, address(resolver));

        vm.prank(alice);
        registry.setResolver(tokenId, address(resolver));
    }

    function test_setResolver_fails_non_owner() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");

        vm.prank(bob);
        vm.expectRevert("ClawRegistry: not owner or approved");
        registry.setResolver(tokenId, address(resolver));
    }

    function test_setResolver_by_approved() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");

        vm.prank(alice);
        registry.approve(bob, tokenId);

        vm.prank(bob);
        registry.setResolver(tokenId, address(resolver));

        assertEq(registry.resolver(tokenId), address(resolver));
    }

    // =========================================================================
    // ClawResolver address record tests
    // =========================================================================

    function test_resolver_setAddr() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        bytes32 node = ClawNamehash.namehash("alice");

        vm.prank(alice);
        resolver.setAddr(node, alice);

        assertEq(resolver.addr(node), alice);
    }

    function test_resolver_setAddr_emits_event() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        bytes32 node = ClawNamehash.namehash("alice");

        vm.expectEmit(true, false, false, true);
        emit ClawResolver.AddrChanged(node, alice);

        vm.prank(alice);
        resolver.setAddr(node, alice);
    }

    function test_resolver_setAddr_fails_non_owner() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        bytes32 node = ClawNamehash.namehash("alice");

        vm.prank(bob);
        vm.expectRevert("ClawResolver: not authorized");
        resolver.setAddr(node, bob);
    }

    function test_resolver_setAddr_by_approved_operator() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        bytes32 node = ClawNamehash.namehash("alice");

        vm.prank(alice);
        registry.setApprovalForAll(bob, true);

        vm.prank(bob);
        resolver.setAddr(node, carol);

        assertEq(resolver.addr(node), carol);
    }

    function test_resolver_addr_default_zero() public view {
        bytes32 node = ClawNamehash.namehash("unregistered");
        assertEq(resolver.addr(node), address(0));
    }

    // =========================================================================
    // ClawResolver text record tests
    // =========================================================================

    function test_resolver_setText() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        bytes32 node = ClawNamehash.namehash("alice");

        vm.prank(alice);
        resolver.setText(node, "avatar", "https://example.com/avatar.png");

        assertEq(resolver.text(node, "avatar"), "https://example.com/avatar.png");
    }

    function test_resolver_setText_emits_event() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        bytes32 node = ClawNamehash.namehash("alice");

        vm.expectEmit(true, false, false, true);
        emit ClawResolver.TextChanged(node, "url", "https://example.com");

        vm.prank(alice);
        resolver.setText(node, "url", "https://example.com");
    }

    function test_resolver_setText_multiple_keys() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        bytes32 node = ClawNamehash.namehash("alice");

        vm.startPrank(alice);
        resolver.setText(node, "avatar", "https://example.com/avatar.png");
        resolver.setText(node, "url", "https://example.com");
        resolver.setText(node, "email", "alice@example.com");
        resolver.setText(node, "twitter", "@alice");
        resolver.setText(node, "github", "alice");
        resolver.setText(node, "description", "I am Alice");
        vm.stopPrank();

        assertEq(resolver.text(node, "avatar"), "https://example.com/avatar.png");
        assertEq(resolver.text(node, "url"), "https://example.com");
        assertEq(resolver.text(node, "email"), "alice@example.com");
        assertEq(resolver.text(node, "twitter"), "@alice");
        assertEq(resolver.text(node, "github"), "alice");
        assertEq(resolver.text(node, "description"), "I am Alice");
    }

    function test_resolver_setText_fails_non_owner() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        bytes32 node = ClawNamehash.namehash("alice");

        vm.prank(bob);
        vm.expectRevert("ClawResolver: not authorized");
        resolver.setText(node, "avatar", "hack");
    }

    function test_resolver_text_default_empty() public view {
        bytes32 node = ClawNamehash.namehash("unregistered");
        assertEq(resolver.text(node, "avatar"), "");
    }

    // =========================================================================
    // ERC721 tests
    // =========================================================================

    function test_erc721_transfer() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");

        vm.prank(alice);
        registry.transferFrom(alice, bob, tokenId);

        assertEq(registry.ownerOf(tokenId), bob);
    }

    function test_erc721_transfer_fails_expired() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");

        vm.warp(block.timestamp + 366 days);

        vm.prank(alice);
        vm.expectRevert("ClawRegistry: domain has expired");
        registry.transferFrom(alice, bob, tokenId);
    }

    function test_erc721_token_uri() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");
        string memory uri = registry.tokenURI(tokenId);
        assertEq(uri, "https://claw.domains/metadata/alice");
    }

    function test_getName() public {
        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");
        assertEq(registry.getName(tokenId), "alice");
    }

    // =========================================================================
    // Name validation edge cases
    // =========================================================================

    function test_register_single_char() public {
        _mintApproveRegister(alice, "a", USDC_12);
        assertEq(registry.ownerOf(ClawNamehash.labelToId("a")), alice);
    }

    function test_register_with_numbers() public {
        _mintApproveRegister(alice, "alice123", USDC_5PLUS);
        assertEq(registry.ownerOf(ClawNamehash.labelToId("alice123")), alice);
    }

    function test_register_with_hyphen() public {
        _mintApproveRegister(alice, "my-name", USDC_5PLUS);
        assertEq(registry.ownerOf(ClawNamehash.labelToId("my-name")), alice);
    }

    function test_register_fails_uppercase() public {
        mockUsdc.mint(alice, USDC_5PLUS);
        vm.prank(alice);
        mockUsdc.approve(address(registry), USDC_5PLUS);

        vm.prank(alice);
        vm.expectRevert("ClawRegistry: invalid label");
        registry.register("Alice", alice);
    }

    function test_register_fails_leading_hyphen() public {
        mockUsdc.mint(alice, USDC_12);
        vm.prank(alice);
        mockUsdc.approve(address(registry), USDC_12);

        vm.prank(alice);
        vm.expectRevert("ClawRegistry: invalid label");
        registry.register("-abc", alice);
    }

    function test_register_fails_trailing_hyphen() public {
        mockUsdc.mint(alice, USDC_5PLUS);
        vm.prank(alice);
        mockUsdc.approve(address(registry), USDC_5PLUS);

        vm.prank(alice);
        vm.expectRevert("ClawRegistry: invalid label");
        registry.register("abc-", alice);
    }

    function test_register_fails_special_chars() public {
        mockUsdc.mint(alice, USDC_5PLUS);
        vm.prank(alice);
        mockUsdc.approve(address(registry), USDC_5PLUS);

        vm.prank(alice);
        vm.expectRevert("ClawRegistry: invalid label");
        registry.register("alice.claw", alice);
    }

    function test_register_fails_spaces() public {
        mockUsdc.mint(alice, USDC_5PLUS);
        vm.prank(alice);
        mockUsdc.approve(address(registry), USDC_5PLUS);

        vm.prank(alice);
        vm.expectRevert("ClawRegistry: invalid label");
        registry.register("alice bob", alice);
    }

    // =========================================================================
    // Expiry / lifecycle tests
    // =========================================================================

    function test_nameExpires_set_correctly() public {
        uint256 before_ = block.timestamp;

        _mintApproveRegister(alice, "alice", USDC_5PLUS);

        uint256 tokenId = ClawNamehash.labelToId("alice");
        uint256 expires = registry.nameExpires(tokenId);

        assertEq(expires, before_ + 365 days);
    }

    function test_nameExpires_unregistered_returns_zero() public view {
        uint256 tokenId = ClawNamehash.labelToId("unregistered");
        assertEq(registry.nameExpires(tokenId), 0);
    }

    function test_full_lifecycle() public {
        // 1. Alice registers
        _mintApproveRegister(alice, "lifecycle", USDC_5PLUS);
        uint256 tokenId = ClawNamehash.labelToId("lifecycle");
        assertEq(registry.ownerOf(tokenId), alice);

        // 2. Alice sets resolver
        vm.prank(alice);
        registry.setResolver(tokenId, address(resolver));

        // 3. Alice sets address record
        bytes32 node = ClawNamehash.namehash("lifecycle");
        vm.prank(alice);
        resolver.setAddr(node, alice);
        assertEq(resolver.addr(node), alice);

        // 4. Alice transfers to bob
        vm.prank(alice);
        registry.transferFrom(alice, bob, tokenId);
        assertEq(registry.ownerOf(tokenId), bob);

        // 5. Bob renews
        _mintApproveRenew(bob, tokenId, USDC_5PLUS);

        // 6. Domain expires
        uint256 renewedExpiry = registry.nameExpires(tokenId);
        vm.warp(renewedExpiry + 1);
        assertTrue(registry.available("lifecycle"));

        // 7. Carol re-registers
        _mintApproveRegister(carol, "lifecycle", USDC_5PLUS);
        assertEq(registry.ownerOf(tokenId), carol);
    }

    // =========================================================================
    // Resolver update registry tests
    // =========================================================================

    function test_resolver_setRegistry_by_owner() public {
        ClawRegistry newRegistry = new ClawRegistry(owner, address(mockUsdc));
        vm.prank(owner);
        resolver.setRegistry(address(newRegistry));
        assertEq(address(resolver.registry()), address(newRegistry));
    }

    function test_resolver_setRegistry_fails_non_owner() public {
        ClawRegistry newRegistry = new ClawRegistry(owner, address(mockUsdc));
        vm.prank(alice);
        vm.expectRevert();
        resolver.setRegistry(address(newRegistry));
    }

    // =========================================================================
    // Fuzz tests
    // =========================================================================

    function testFuzz_getPrice_5plus(string memory label) public view {
        vm.assume(bytes(label).length >= 5);
        vm.assume(bytes(label).length <= 63);
        registry.getUsdcPrice(label);
    }

    function testFuzz_labelToId_unique(string memory a, string memory b) public pure {
        vm.assume(keccak256(bytes(a)) != keccak256(bytes(b)));
        assertNotEq(ClawNamehash.labelToId(a), ClawNamehash.labelToId(b));
    }
}
