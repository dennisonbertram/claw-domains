# Arc Testnet USDC Contract Research

**Date:** 2026-03-15
**Contract:** `0x3600000000000000000000000000000000000000`
**Chain:** Arc Testnet (chain ID 5042002)
**RPC:** `https://arc-testnet.g.alchemy.com/v2/...`

---

## Executive Summary

The USDC contract on Arc Testnet is a **Circle FiatTokenV2** deployed behind an **AdminUpgradeabilityProxy**. It is a full-featured USDC implementation -- not a minimal precompile. It supports **EIP-2612 permit** and **EIP-3009 transferWithAuthorization / receiveWithAuthorization**. Single-transaction domain registration via permit is viable.

---

## 1. Basic ERC-20 Checks

| Function | Result | Notes |
|----------|--------|-------|
| `name()` | `"USDC"` | Standard Circle USDC name |
| `symbol()` | `"USDC"` | Standard Circle USDC symbol |
| `decimals()` | `6` | Standard USDC precision (ERC-20 interface) |
| `totalSupply()` | `25,900,934,588,796,687` (2.59e16) | ~25.9 billion USDC at 6 decimals; testnet supply |
| `version()` | `"2"` | Confirms **FiatTokenV2** implementation |

### Native vs ERC-20 Decimal Relationship

Arc USDC has a dual-interface design:
- **Native layer (gas):** 18 decimals (queried via `eth_getBalance`)
- **ERC-20 layer (token):** 6 decimals (queried via `balanceOf()`)

**Verified example** (owner address `0xDC29Bab4A7d5425cA44eeF20a5B67E3D897F9a03`):
- Native balance: `999,999,999,999,999,701,760` (18 decimals)
- ERC-20 balance: `999,999,999` (6 decimals)
- Ratio: `999999999999999701760 / 999999999 ≈ 1e12` -- confirms 18-to-6 decimal truncation

---

## 2. Contract Architecture

### Proxy Pattern

The contract at `0x3600...` is an **AdminUpgradeabilityProxy** (OpenZeppelin-style).

**Bytecode size (proxy):** 3,599 characters (~1,799 bytes) -- standard proxy bytecode.

**Storage slot analysis:**

| Slot | Purpose | Value |
|------|---------|-------|
| `0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3` | Implementation address | `0x3910b7cBb3341F1f4Bf4cEb66e4a2c8f204fE2b8` |
| `0x10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b` | Proxy admin address | `0x49F78Af090f1f98E7184b7F61F1F1a8a8064B40D` |
| `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc` | EIP-1967 impl slot | `0x0000...0000` (not used; proxy uses custom slots) |

### Implementation Contract

**Address:** `0x3910b7cBb3341F1f4Bf4cEb66e4a2c8f204fE2b8`
**Bytecode size:** 46,781 characters (~23,390 bytes) -- **full contract**, not a precompile.

This is a complete Circle FiatTokenV2 deployment with all standard functionality.

### Administrative Roles

| Role | Address |
|------|---------|
| `owner()` | `0xDC29Bab4A7d5425cA44eeF20a5B67E3D897F9a03` |
| `masterMinter()` | `0xa1F45991b7928B14f2047E36958D6Ae7D24bbf41` |
| `pauser()` | `0xbc639a0A060E5831a7c437b491B8d3C1f58F554e` |
| `blacklister()` | `0xE29672dcF004AE74da3700262D384ce23de16729` |
| `rescuer()` | `0x28E2716951f9fC8dF918e1BeDB54E4e2BDB2a362` |

---

## 3. EIP-2612 Permit Support

**Verdict: YES -- fully supported.**

### Evidence

| Check | Result |
|-------|--------|
| `DOMAIN_SEPARATOR()` | `0x361191522483d32a83e70ae7183b4b9629442c13a78bc9921d6f707911c8c6b0` |
| `nonces(0x...01)` | `0` (correct default) |
| `permit()` with expired deadline | Reverted with `"FiatTokenV2: permit is expired"` |

The `permit()` call with deadline=0 correctly rejects the call as expired. This confirms:
1. The `permit()` function **exists** and is **callable**
2. It validates the deadline parameter
3. It would proceed to signature verification if the deadline were valid

The revert message `"FiatTokenV2: permit is expired"` is the standard Circle FiatTokenV2 permit error, confirming this is Circle's canonical implementation.

### DOMAIN_SEPARATOR

The EIP-712 domain is computed with:
- `name`: `"USDC"`
- `version`: `"2"`
- `chainId`: `5042002`
- `verifyingContract`: `0x3600000000000000000000000000000000000000`

---

## 4. EIP-3009 Support (transferWithAuthorization / receiveWithAuthorization)

**Verdict: YES -- fully supported.**

### Evidence

| Function | Test Result | Error Message |
|----------|------------|---------------|
| `transferWithAuthorization()` | Reverted | `"FiatTokenV2: authorization is expired"` |
| `receiveWithAuthorization()` | Reverted | `"FiatTokenV2: caller must be the payee"` |
| `cancelAuthorization()` | Reverted | `"ECRecover: invalid signature 'v' value"` |
| `authorizationState()` | `false` | Correct default for unused nonce |

All three EIP-3009 functions exist and validate their inputs correctly:
- `transferWithAuthorization` checks expiry before signature
- `receiveWithAuthorization` checks caller identity before expiry
- `cancelAuthorization` attempts signature verification (fails on invalid `v`)
- `authorizationState` returns correct defaults

---

## 5. Permit2 Availability

**Permit2 is deployed on Arc Testnet.**

| Contract | Address | Bytecode Size |
|----------|---------|---------------|
| Permit2 | `0x000000000022D473030F116dDEE9F6B43aC78BA3` | 18,307 chars (~9,153 bytes) |

This is the canonical Uniswap Permit2 address. It is a full contract deployment, providing an alternative approval mechanism if needed.

---

## 6. Bytecode Nature: Full Contract vs Precompile

**This is NOT a precompile. It is a full Solidity contract behind a proxy.**

Evidence:
- Proxy bytecode: 3,599 chars -- standard AdminUpgradeabilityProxy
- Implementation bytecode: 46,781 chars -- full FiatTokenV2 contract
- Contains all Circle FiatTokenV2 functions (permit, transferWithAuthorization, blacklist, pause, etc.)
- Error messages are standard Circle text (`"FiatTokenV2: ..."`)
- The proxy uses OpenZeppelin's AdminUpgradeabilityProxy pattern with custom storage slots

Arc's documentation calls this a "precompile" or "system contract" at address `0x3600...`, but the implementation is a standard Solidity contract. The "precompile" aspect is that Arc's consensus layer synchronizes the ERC-20 state with the native gas balance.

---

## 7. Web Research Findings

### Arc's Dual-Interface USDC Design

From [Arc's blog post](https://www.arc.network/blog/building-with-usdc-on-arc-one-token-two-interfaces):
- USDC is Arc's **native gas token** AND an **ERC-20 token**
- The precompile keeps native and ERC-20 states synchronized
- Native balance uses 18 decimals; ERC-20 uses 6 decimals
- **Do not mix reads** without adjusting for decimals
- SDKs may display duplicate balances -- they are the same funds

### Official Contract Addresses (from [Arc Docs](https://docs.arc.network/arc/references/contract-addresses))

| Token | Address | Notes |
|-------|---------|-------|
| USDC | `0x3600000000000000000000000000000000000000` | "Optional ERC-20 interface for interacting with the native USDC balance. Uses 6 decimals." |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | 6 decimals |
| Permit2 | `0x000000000022D473030F116dDEE9F6B43aC78BA3` | Uniswap canonical |
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` | Standard address |

### Additional Resources
- [Arc Network homepage](https://www.arc.network/)
- [Deploy on Arc tutorial](https://docs.arc.network/arc/tutorials/deploy-on-arc)
- [Circle blog: Introducing Arc](https://www.circle.com/blog/introducing-arc-an-open-layer-1-blockchain-purpose-built-for-stablecoin-finance)
- [Arc USDC demo repo](https://github.com/qwerty12345671/arc-usdc-demo)
- [Thirdweb Arc Testnet reference](https://thirdweb.com/arc-testnet)

---

## 8. Recommendation: Permit for Single-TX Registration

**YES -- we can use EIP-2612 permit for single-transaction domain registration.**

### Why it works

1. **Permit is fully implemented** -- FiatTokenV2 with standard Circle error handling
2. **DOMAIN_SEPARATOR is valid** -- computed with chain ID 5042002 and the correct verifying contract
3. **Nonces work** -- returns correct defaults, will increment on use
4. **The contract is a real Solidity contract** -- not a precompile stub. All ERC-20 and permit logic executes normally.

### Implementation approach

The registration contract should:
1. Accept a permit signature (v, r, s, deadline, amount) alongside registration parameters
2. Call `USDC.permit(user, registryContract, amount, deadline, v, r, s)` to set allowance
3. Call `USDC.transferFrom(user, registryContract, amount)` to collect payment
4. Execute domain registration logic

This allows the user to sign one off-chain message (the permit) and submit one transaction (register), instead of requiring a separate `approve()` transaction.

### Alternative: EIP-3009 transferWithAuthorization

EIP-3009 is also available and could simplify further -- the user signs an authorization for a specific transfer, and the registry calls `transferWithAuthorization()` directly. This avoids the approve/transferFrom pattern entirely. However, EIP-2612 permit is more widely supported by frontend libraries and wallets.

### Alternative: Permit2

Uniswap's Permit2 is also deployed at the canonical address. This could be used as a fallback or for batch operations, but adds complexity. For MVP, native EIP-2612 permit on the USDC contract itself is the simplest path.

---

## Raw Call Results

### Successful calls

```
cast call 0x3600...0000 "name()(string)"
→ "USDC"

cast call 0x3600...0000 "symbol()(string)"
→ "USDC"

cast call 0x3600...0000 "decimals()(uint8)"
→ 6

cast call 0x3600...0000 "totalSupply()(uint256)"
→ 25900934588796687 [2.59e16]

cast call 0x3600...0000 "DOMAIN_SEPARATOR()(bytes32)"
→ 0x361191522483d32a83e70ae7183b4b9629442c13a78bc9921d6f707911c8c6b0

cast call 0x3600...0000 "nonces(address)(uint256)" 0x0...01
→ 0

cast call 0x3600...0000 "authorizationState(address,bytes32)(bool)" 0x0...01 0x0...00
→ false

cast call 0x3600...0000 "version()(string)"
→ "2"

cast call 0x3600...0000 "owner()(address)"
→ 0xDC29Bab4A7d5425cA44eeF20a5B67E3D897F9a03

cast call 0x3600...0000 "masterMinter()(address)"
→ 0xa1F45991b7928B14f2047E36958D6Ae7D24bbf41

cast call 0x3600...0000 "pauser()(address)"
→ 0xbc639a0A060E5831a7c437b491B8d3C1f58F554e

cast call 0x3600...0000 "blacklister()(address)"
→ 0xE29672dcF004AE74da3700262D384ce23de16729

cast call 0x3600...0000 "rescuer()(address)"
→ 0x28E2716951f9fC8dF918e1BeDB54E4e2BDB2a362

cast call 0x3600...0000 "allowance(address,address)(uint256)" 0x0...01 0x0...02
→ 0

cast call 0x3600...0000 "balanceOf(address)(uint256)" 0xDC29...9a03
→ 999999999 [9.999e8]

cast balance 0xDC29...9a03
→ 999999999999999701760 (native, 18 decimals)
```

### Reverted calls (proving function existence)

```
cast call 0x3600...0000 "permit(...)" [with deadline=0]
→ REVERT: "FiatTokenV2: permit is expired"

cast call 0x3600...0000 "transferWithAuthorization(...)" [with validBefore=0]
→ REVERT: "FiatTokenV2: authorization is expired"

cast call 0x3600...0000 "receiveWithAuthorization(...)" [with wrong caller]
→ REVERT: "FiatTokenV2: caller must be the payee"

cast call 0x3600...0000 "cancelAuthorization(...)" [with v=0]
→ REVERT: "ECRecover: invalid signature 'v' value"
```

### Bytecode / storage

```
Proxy bytecode size: ~1,799 bytes (AdminUpgradeabilityProxy)
Implementation bytecode size: ~23,390 bytes (FiatTokenV2)
Implementation address (slot 0x7050...): 0x3910b7cBb3341F1f4Bf4cEb66e4a2c8f204fE2b8
Proxy admin (slot 0x10d6...): 0x49F78Af090f1f98E7184b7F61F1F1a8a8064B40D
EIP-1967 slot: 0x000...000 (not used by this proxy)
Permit2 bytecode size: ~9,153 bytes (deployed at canonical address)
```
