# USDC Payment Support — ClawRegistry

## Summary

Added dual-currency payment support (USDC and ETH) to the `.claw` domain registry contracts. All existing functionality is preserved; USDC is an additive payment path.

## Files Changed

### `contracts/src/ClawRegistry.sol`

**New imports**
- `@openzeppelin/contracts/token/ERC20/IERC20.sol`
- `@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol`

**New state**
- `IERC20 public immutable usdc` — set in constructor, never changes after deploy
- `uint256[4] public usdcPrices` — owner-configurable; index 0=5+chars, 1=4chars, 2=3chars, 3=1-2chars
- `uint256[4] public ethPrices` — same layout, replaces the four `PRICE_*` constants

**Constructor signature change**
```
constructor(address initialOwner, address usdcToken)
```
Default USDC prices (6 decimals): `[$5, $20, $50, $200]`
Default ETH prices: `[0.01, 0.05, 0.1, 0.5]` ETH

**Function changes**

| Old | New |
|-----|-----|
| `register(name, owner)` | `register(name, owner, payWithUsdc)` |
| `renew(tokenId)` | `renew(tokenId, payWithUsdc)` |
| `getPrice(name)` | `getEthPrice(name)` + `getUsdcPrice(name)` |
| `withdraw()` | `withdrawEth()` |

**New functions**
- `setPrices(uint256[4] newUsdcPrices, uint256[4] newEthPrices) external onlyOwner`
- `withdrawUsdc() external onlyOwner`

**New event**
- `PricesUpdated(uint256[4] usdcPrices, uint256[4] ethPrices)`

**Payment logic**
- `payWithUsdc == true`: requires `msg.value == 0`; pulls exact USDC amount via `safeTransferFrom`
- `payWithUsdc == false`: ETH path as before; refunds any overpayment

**Internal helper**
- `_priceIndex(uint256 len) private pure returns (uint256)` — maps label length to price array index

### `contracts/script/Deploy.s.sol`

- Added USDC address constants for Base mainnet (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`) and Base Sepolia (`0x036CbD53842c5426634e7929541eC2318f3dCF7e`)
- Constructor call updated: `new ClawRegistry(deployer, usdcAddr)`

### `contracts/test/ClawDomains.t.sol`

**setUp changes**
- Deploys `MockUSDC` (6-decimal ERC20 with public `mint`)
- Passes `address(mockUsdc)` to `ClawRegistry` constructor

**All existing tests updated**
- `register(...)` calls now pass `false` for `payWithUsdc`
- `renew(...)` calls now pass `false` for `payWithUsdc`
- `getPrice(...)` calls renamed to `getEthPrice(...)`
- `withdraw()` calls renamed to `withdrawEth()`
- `new ClawRegistry(owner)` calls updated to `new ClawRegistry(owner, address(mockUsdc))`

**New tests added**

| Test | Description |
|------|-------------|
| `testRegisterWithUsdc` | Mint USDC, approve, register — verifies ownership and registry balance |
| `testRegisterUsdcInsufficientAllowance` | Expects revert when allowance < price |
| `testRegisterUsdcRevertsIfEthSent` | Expects revert when ETH is sent with USDC payment |
| `testRegisterWithUsdcCorrectTiers` | Verifies 1-char and 3-char USDC price tiers |
| `testRenewWithUsdc` | Renew an ETH-registered domain using USDC |
| `testRenewUsdcInsufficientAllowance` | Expects revert |
| `testSetPrices` | Owner updates all tiers; verifies via getters |
| `testSetPricesEmitsEvent` | Verifies `PricesUpdated` event |
| `testSetPricesNotOwner` | Non-owner call reverts |
| `testWithdrawUsdc` | Owner drains USDC balance |
| `testWithdrawUsdcFailsNonOwner` | Non-owner call reverts |
| `testWithdrawUsdcFailsEmpty` | Reverts when balance is zero |

## Test Results

```
Ran 85 tests for test/ClawDomains.t.sol:ClawDomainsTest
Suite result: ok. 85 passed; 0 failed; 0 skipped

Ran 2 tests for test/Counter.t.sol:CounterTest
Suite result: ok. 2 passed; 0 failed; 0 skipped

Total: 87 tests passed, 0 failed, 0 skipped
```
