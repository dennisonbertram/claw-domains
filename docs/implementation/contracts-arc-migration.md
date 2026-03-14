# Smart Contracts: Arc Network Migration (USDC-Only)

## Summary

Migrated all smart contracts from Base L2 to Arc Network, removing all ETH payment logic and making USDC the sole payment method.

## Changes Made

### contracts/src/ClawRegistry.sol
- Removed `payable` modifier from `register()` and `renew()`
- Removed `bool payWithUsdc` parameter from both functions
- Removed `ethPrices[4]` state variable
- Removed ETH refund logic (`msg.sender.call{value: ...}`)
- Removed `withdrawEth()` function
- Removed `receive() external payable` fallback
- Removed `getEthPrice()` function
- Simplified `setPrices()` to accept only `uint256[4] calldata newUsdcPrices`
- Updated `PricesUpdated` event to emit only USDC prices
- Removed `ethPrices` initialization from constructor
- Updated NatSpec: "Base L2" -> "Arc Network"

Final function signatures:
- `register(string calldata name, address domainOwner) external`
- `renew(uint256 tokenId) external`
- `setPrices(uint256[4] calldata newUsdcPrices) external onlyOwner`

### contracts/script/Deploy.s.sol
- Replaced `BASE_CHAIN_ID` (8453) and `BASE_SEPOLIA_CHAIN_ID` (84532) with `ARC_TESTNET_CHAIN_ID` (5042002)
- Replaced `BASE_USDC` and `BASE_SEPOLIA_USDC` with `ARC_TESTNET_USDC` (`0x3600000000000000000000000000000000000000`)
- Updated `require()` to check for Arc testnet chain ID only
- Updated console log messages

### contracts/foundry.toml
- Replaced Base mainnet/sepolia RPC endpoints with `arc_testnet = "https://rpc.testnet.arc.network"`
- Replaced Basescan etherscan config with `arc_testnet = { key = "${ARCSCAN_API_KEY}", url = "https://testnet.arcscan.app/api" }`

### contracts/test/ClawDomains.t.sol
- Removed ETH price constants (`PRICE_5PLUS`, `PRICE_4`, `PRICE_3`, `PRICE_12`)
- Removed `vm.deal()` calls for test accounts (no ETH needed)
- Removed all ETH-based registration tests (refund, insufficient payment with ETH, etc.)
- Removed all ETH-based renewal tests
- Removed `withdrawEth` tests (3 tests)
- Removed ETH pricing tests (`test_price_1char` through `test_price_long_name`)
- Converted all remaining tests to use USDC via helper functions
- Added helper functions: `_mintApproveRegister()`, `_mintApproveRegisterFor()`, `_mintApproveRenew()`
- Updated all `register(name, owner, true/false)` calls to `register(name, owner)`
- Updated all `renew(tokenId, true/false)` calls to `renew(tokenId)`
- Updated `setPrices` tests to use single-argument form
- Updated fuzz test to use `getUsdcPrice` instead of `getEthPrice`

## Build Output

```
Compiler run successful!
```

Solc 0.8.24, no errors.

## Test Results

```
Ran 75 tests for test/ClawDomains.t.sol:ClawDomainsTest
Suite result: ok. 75 passed; 0 failed; 0 skipped

Ran 2 test suites in 344.30ms: 77 tests passed, 0 failed, 0 skipped (77 total tests)
```

All 75 ClawDomains tests passed + 2 Counter tests = 77 total, 0 failures.

## USDC Pricing (unchanged)

| Name Length | Price (USDC, 6 decimals) | USD |
|-------------|--------------------------|-----|
| 5+ chars    | 5,000,000                | $5  |
| 4 chars     | 20,000,000               | $20 |
| 3 chars     | 50,000,000               | $50 |
| 1-2 chars   | 200,000,000              | $200|

## Arc Network Details

- Chain ID: 5042002 (testnet)
- USDC Address: `0x3600000000000000000000000000000000000000`
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`
