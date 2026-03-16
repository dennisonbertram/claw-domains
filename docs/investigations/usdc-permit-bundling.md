# Investigation: USDC Permit & Transaction Bundling for Single-Action Registration

**Date**: 2026-03-15
**Goal**: Determine how to combine USDC approve + domain register into a single user action on Arc Testnet.

---

## 1. Does USDC Support EIP-2612 Permit?

### On Mainnet (Ethereum, Base, Arbitrum, etc.) — YES

Circle's USDC v2 contract implements **both** EIP-2612 (permit) and EIP-3009 (transferWithAuthorization / receiveWithAuthorization). This is well-documented by Circle.

**EIP-2612 permit function signature:**
```solidity
function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
) external
```

**Supporting functions:**
```solidity
function nonces(address owner) external view returns (uint256)
function DOMAIN_SEPARATOR() external view returns (bytes32)
```

**EIP-712 domain for USDC v2:**
- `name`: `"USDC"`
- `version`: `"2"`
- `chainId`: (chain-specific)
- `verifyingContract`: (USDC contract address on that chain)

**PERMIT_TYPEHASH:**
```
keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)")
```

### On Arc Testnet — UNCERTAIN / LIKELY NO

Arc's USDC at `0x3600000000000000000000000000000000000000` is **not a standard Circle USDC v2 deployment**. It is a **precompiled system contract** that serves as both the native gas token (18 decimals) and an ERC-20 interface (6 decimals). A precompile forwards ERC-20 calls (like `balanceOf`, `transfer`, `approve`) to the underlying native balance.

**Key concern**: Arc's documentation for the USDC precompile only describes standard ERC-20 functions (`balanceOf`, `transfer`, `approve`, `transferFrom`). There is **no mention** of EIP-2612 `permit()`, `nonces()`, or `DOMAIN_SEPARATOR()` support on the precompile. Since this is a precompile (not a Solidity contract), it would need to explicitly implement the EIP-2612 interface — and there is no evidence it does.

**This must be verified on-chain** by calling `permit()`, `nonces()`, or `DOMAIN_SEPARATOR()` on `0x3600000000000000000000000000000000000000` on Arc Testnet. If these calls revert, permit is not supported.

### EIP-3009 (transferWithAuthorization / receiveWithAuthorization) — Also Uncertain on Arc

Standard Circle USDC v2 also supports EIP-3009:
```solidity
function receiveWithAuthorization(
    address from,
    address to,
    uint256 value,
    uint256 validAfter,
    uint256 validBefore,
    bytes32 nonce,
    uint8 v,
    bytes32 r,
    bytes32 s
) external
```

`receiveWithAuthorization` is actually better than `permit` for our use case because:
- It transfers directly (no separate `transferFrom` step)
- The contract calls it with `to = address(this)`, which prevents front-running
- Uses random nonces (not sequential), allowing concurrent authorizations

However, the same uncertainty applies: Arc's USDC precompile may not implement EIP-3009.

---

## 2. Arc Network Transaction Bundling & Account Abstraction

### Multicall3 — Available but NOT Useful for This

Arc Testnet has **Multicall3** deployed at `0xcA11bde05977b3631167028862bE2a173976CA11`.

However, Multicall3 is **not useful for combining approve + register** because:
- When an EOA calls Multicall3, `msg.sender` inside the batched calls is the **Multicall3 contract address**, not the user
- The USDC `approve(registry, amount)` call would set Multicall3's allowance, not the user's
- The `register()` call would have `msg.sender = Multicall3`, so `transferFrom` would try to pull from Multicall3

Multicall3 is designed for **read batching** (batching view calls), not for write batching from EOAs.

### Permit2 — Available and VERY Promising

Arc Testnet has **Uniswap Permit2** deployed at `0x000000000022D473030F116dDEE9F6B43aC78BA3`.

Permit2 works with **any ERC-20 token**, even those without native EIP-2612 support. The flow:
1. User does a **one-time** `approve(Permit2, type(uint256).max)` on the USDC token
2. For all future interactions, user signs an off-chain EIP-712 message granting Permit2 permission
3. The receiving contract calls Permit2 to pull tokens using the signature

This is the approach used by Uniswap Universal Router, 1inch, and many other protocols.

### Account Abstraction (ERC-4337) — Available but Heavyweight

Arc supports ERC-4337 account abstraction with multiple providers:
- **Pimlico** — bundler and paymaster infrastructure
- **Biconomy** — modular smart accounts, paymasters, bundlers
- **Zerodev** — ERC-4337 deployment, session keys
- **Thirdweb** — full-stack AA toolkit
- **Blockradar** — smart account management, transaction bundling

With AA, a smart contract wallet could batch approve + register into a single UserOperation. However, this requires users to have or create a smart contract wallet, which is a significant UX change and much heavier than needed for this feature.

### EIP-7702 — Not Yet Confirmed on Arc

EIP-7702 allows EOAs to temporarily delegate to smart contract code, enabling batch transactions from regular wallets. Arc docs do not currently confirm EIP-7702 support.

---

## 3. Implementation Approaches (Ranked by Simplicity)

### Approach A: Router Contract with `registerWithPermit()` (Simplest if permit works)

If Arc's USDC precompile supports EIP-2612 permit:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

interface IClawRegistry {
    function register(string calldata name, address domainOwner) external;
    function getUsdcPrice(string memory name) external view returns (uint256);
    function usdc() external view returns (IERC20);
}

contract ClawRegistrationRouter {
    IClawRegistry public immutable registry;
    IERC20Permit public immutable usdc;

    constructor(address _registry) {
        registry = IClawRegistry(_registry);
        usdc = IERC20Permit(address(registry.usdc()));
        // Approve the registry to spend USDC held by this router
        IERC20(address(usdc)).approve(_registry, type(uint256).max);
    }

    /// @notice Register a domain in one transaction using EIP-2612 permit
    /// @dev User signs a permit off-chain, then calls this function
    function registerWithPermit(
        string calldata name,
        address domainOwner,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        uint256 price = registry.getUsdcPrice(name);

        // Execute the permit: user approves this router to spend their USDC
        usdc.permit(msg.sender, address(this), price, deadline, v, r, s);

        // Pull USDC from user to this router
        IERC20(address(usdc)).transferFrom(msg.sender, address(this), price);

        // Register the domain (router pays the registry)
        registry.register(name, domainOwner);
    }
}
```

**Pros**: Clean single-transaction UX. No changes to existing ClawRegistry contract.
**Cons**: Requires Arc USDC to support permit (uncertain). Adds a router contract.

### Approach B: Router Contract with Permit2 (Works with ANY ERC-20)

Uses Uniswap's Permit2, which is already deployed on Arc:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPermit2 {
    struct PermitSingle {
        PermitDetails details;
        address spender;
        uint256 sigDeadline;
    }
    struct PermitDetails {
        address token;
        uint160 amount;
        uint48 expiration;
        uint48 nonce;
    }

    function permit(
        address owner,
        PermitSingle memory permitSingle,
        bytes calldata signature
    ) external;

    function transferFrom(
        address from,
        address to,
        uint160 amount,
        address token
    ) external;
}

interface IClawRegistry {
    function register(string calldata name, address domainOwner) external;
    function getUsdcPrice(string memory name) external view returns (uint256);
    function usdc() external view returns (IERC20);
}

contract ClawRegistrationRouterPermit2 {
    IClawRegistry public immutable registry;
    IERC20 public immutable usdc;
    IPermit2 public immutable permit2;

    constructor(address _registry, address _permit2) {
        registry = IClawRegistry(_registry);
        usdc = registry.usdc();
        permit2 = IPermit2(_permit2);
        // Approve registry to pull USDC from this contract
        usdc.approve(_registry, type(uint256).max);
    }

    /// @notice Register a domain using Permit2 signature
    /// @dev User must have done a one-time approve(Permit2, MAX) on USDC first
    function registerWithPermit2(
        string calldata name,
        address domainOwner,
        IPermit2.PermitSingle calldata permitSingle,
        bytes calldata signature
    ) external {
        uint256 price = registry.getUsdcPrice(name);

        // Execute permit2: grants this router allowance via signature
        permit2.permit(msg.sender, permitSingle, signature);

        // Pull USDC from user via Permit2
        permit2.transferFrom(msg.sender, address(this), uint160(price), address(usdc));

        // Register the domain (router pays the registry)
        registry.register(name, domainOwner);
    }
}
```

**Pros**: Works regardless of whether Arc USDC supports native permit. Permit2 is a proven standard used by Uniswap, 1inch, etc. Already deployed on Arc.
**Cons**: Requires user to do a one-time `approve(Permit2, MAX)` on USDC (but only once, ever). Permit2 signatures are more complex than EIP-2612 signatures. Adds a router contract.

### Approach C: Add `registerWithPermit()` Directly to ClawRegistry (Cleanest)

Modify the existing ClawRegistry to accept permit parameters:

```solidity
/// @notice Register with EIP-2612 permit (single transaction)
function registerWithPermit(
    string calldata name,
    address domainOwner,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
) external {
    require(ClawNamehash.isValidLabel(name), "ClawRegistry: invalid label");

    uint256 price = getUsdcPrice(name);

    // Execute permit: user approves this registry directly
    IERC20Permit(address(usdc)).permit(
        msg.sender, address(this), price, deadline, v, r, s
    );

    // Now transferFrom works without a separate approve tx
    usdc.safeTransferFrom(msg.sender, address(this), price);

    uint256 tokenId = ClawNamehash.labelToId(name);

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
```

**Pros**: No extra contracts. Cleanest UX. Single transaction.
**Cons**: Requires redeployment of ClawRegistry. Requires Arc USDC to support permit.

### Approach D: Frontend-Only Two-Step with Good UX (No Contract Changes)

Keep the current contract as-is and handle it in the frontend:
1. Check if user already has sufficient USDC allowance for the registry
2. If not, prompt them to approve (can use `approve(registry, MAX)` for one-time setup)
3. Once approved, call `register()`

The frontend shows a stepper UI: "Step 1: Approve USDC" -> "Step 2: Register Domain"

**Pros**: Zero contract changes. Works immediately. Battle-tested pattern (used by most DeFi apps).
**Cons**: Two transactions on first use. Slightly worse UX than single-action.

---

## 4. Verification Steps Needed

Before choosing an approach, we need to verify on-chain:

```javascript
// Test if Arc USDC precompile supports EIP-2612
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

// Try calling DOMAIN_SEPARATOR()
try {
    const domainSep = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: [{ name: 'DOMAIN_SEPARATOR', type: 'function', inputs: [], outputs: [{ type: 'bytes32' }] }],
        functionName: 'DOMAIN_SEPARATOR'
    });
    console.log("DOMAIN_SEPARATOR supported:", domainSep);
} catch (e) {
    console.log("DOMAIN_SEPARATOR NOT supported — permit will not work");
}

// Try calling nonces()
try {
    const nonce = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: [{ name: 'nonces', type: 'function', inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] }],
        functionName: 'nonces',
        args: ["0x0000000000000000000000000000000000000001"]
    });
    console.log("nonces() supported:", nonce);
} catch (e) {
    console.log("nonces() NOT supported — permit will not work");
}
```

---

## 5. Recommendation

### Simplest Path Forward: Approach D (Frontend Two-Step) + Approach C (registerWithPermit) as Enhancement

**Phase 1 — Ship now (no contract changes):**
- Implement Approach D in the frontend
- Check existing USDC allowance before registration
- If allowance is sufficient, go straight to `register()`
- If not, prompt a one-time `approve(registry, type(uint256).max)` then `register()`
- Use a stepper UI component so the user understands the two-step flow
- This is the pattern used by Uniswap, Aave, and essentially all DeFi apps

**Phase 2 — If single-action UX is a priority:**
1. First, verify whether Arc's USDC precompile supports `permit()` and/or `receiveWithAuthorization()`
2. If **permit is supported**: Deploy Approach C (add `registerWithPermit()` to ClawRegistry v2)
3. If **permit is NOT supported**: Deploy Approach B (Permit2 router) — Permit2 is already on Arc and works with any ERC-20
4. Account abstraction (ERC-4337) is available on Arc but is overkill for this specific problem

**Why not jump straight to Permit2?**
Permit2 still requires a one-time `approve(Permit2, MAX)` transaction, so it does not fully eliminate the two-step flow for first-time users. The UX gain over the simpler Approach D is marginal for an MVP. Permit2 becomes more valuable when users interact with multiple dApps on Arc (they only approve Permit2 once).

---

## 6. Summary Table

| Approach | Contract Changes | First-Use Txs | Ongoing Txs | Depends On | Complexity |
|----------|-----------------|---------------|-------------|------------|------------|
| A. Router + EIP-2612 permit | New router contract | 1 | 1 | Arc USDC permit support | Medium |
| B. Router + Permit2 | New router contract | 2 (approve Permit2 once) | 1 | Permit2 on Arc (confirmed) | Medium-High |
| C. Registry `registerWithPermit()` | Modify + redeploy registry | 1 | 1 | Arc USDC permit support | Low-Medium |
| D. Frontend two-step | None | 2 (approve once) | 1 | Nothing | Low |

---

## Sources

- [4 Ways to Authorize USDC Smart Contract Interactions — Circle](https://www.circle.com/blog/four-ways-to-authorize-usdc-smart-contract-interactions-with-circle-sdk)
- [ERC-2612: Permit Extension for EIP-20 Signed Approvals](https://eips.ethereum.org/EIPS/eip-2612)
- [ERC-3009: Transfer With Authorization](https://eips.ethereum.org/EIPS/eip-3009)
- [Arc Account Abstraction Docs](https://docs.arc.network/arc/tools/account-abstraction)
- [Building with USDC on Arc: Two Interfaces for One Token](https://www.arc.network/blog/building-with-usdc-on-arc-one-token-two-interfaces)
- [Arc Contract Addresses](https://docs.arc.network/arc/references/contract-addresses)
- [Uniswap Permit2 Overview](https://docs.uniswap.org/contracts/permit2/overview)
- [Introducing Permit2 & Universal Router — Uniswap Blog](https://blog.uniswap.org/permit2-and-universal-router)
- [Circle Paymaster](https://www.circle.com/paymaster)
- [What Are EIP2612 Permit Signatures? — Revoke.cash](https://revoke.cash/learn/approvals/what-are-eip2612-permit-signatures)
- [An Overview of EIP-3009: Transfer With Authorisation — Extropy](https://academy.extropy.io/pages/articles/review-eip-3009.html)
