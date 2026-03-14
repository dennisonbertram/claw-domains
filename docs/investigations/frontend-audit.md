# Frontend Audit: Mock Data, Placeholder Content & On-Chain Wiring

**Date**: 2026-03-14
**Scope**: All files in `web/src/` — every component, page, and lib file
**Goal**: Identify every piece of mock/hardcoded data, every real on-chain call, and every gap where on-chain data should be used but isn't

---

## Summary Table

| Component / File | Status | What Needs Wiring |
|---|---|---|
| `lib/contracts.ts` | **Real** | ABIs, addresses, namehash, pricing utilities are production-ready |
| `lib/wagmi.ts` | **Real** | Wagmi config with Arc Testnet chain definition is complete |
| `components/Providers.tsx` | **Real** | Privy + Wagmi + React Query provider stack is wired up |
| `components/Nav.tsx` | **Real** | Uses Privy auth + wallet address display — fully wired |
| `app/layout.tsx` | **Real** | Server layout, no data dependencies — fine |
| `app/page.tsx` | **Partial** | Feature descriptions are static marketing copy (OK), but imports PricingSection which has wrong prices |
| `components/HeroContent.tsx` | **Real** | Static marketing content + SearchBar — no data needed |
| `components/AuroraBackground.tsx` | **Real** | Pure visual component — no data needed |
| `components/SearchBar.tsx` | **MOCK** | Availability check uses `setTimeout` + deterministic charSum hack instead of calling `registry.available()` |
| `components/DomainSearchBar.tsx` | **Partial** | Client-side validation works, but no availability check at all — just navigates to register page |
| `components/PricingSection.tsx` | **MOCK** | Hardcoded ETH prices (0.01/0.05/0.1/0.5 ETH) that contradict the actual USDC pricing in contracts.ts |
| `app/register/[name]/RegisterClient.tsx` | **MOCK** | Availability check is `setTimeout` fake. Registration is `setTimeout` fake. No wallet connection, no USDC approval, no contract call |
| `app/profile/ProfileClient.tsx` | **MOCK** | Shows hardcoded `MOCK_DOMAINS` array. No on-chain query for user's domains |
| `app/domain/[name]/DomainClient.tsx` | **MOCK** | Entire domain data is `MOCK_DOMAIN` object. Records edit only updates local state. No on-chain reads or writes |
| `components/DomainCard.tsx` | **Partial** | Presentational component — works fine but receives mock data from parent |
| `components/RecentRegistrations.tsx` | **MOCK** | Uses `PLACEHOLDER_DOMAINS` array. Has TODO comment about event indexing. Not used on any page currently |
| `components/AddressDisplay.tsx` | **Real** | Pure presentational + clipboard — no data dependencies |
| `components/RecordRow.tsx` | **Real** | Pure presentational + clipboard — no data dependencies |
| `components/TxStatus.tsx` | **Real** | Pure presentational state machine — no data dependencies, but never connected to real tx state |

---

## Detailed Findings Per File

### `src/lib/contracts.ts` — STATUS: Real

**Hardcoded/mocked data**: None problematic. Contract addresses are set for Arc Testnet (chainId 5042002). The TODO comment on line 6 says "Update these after deploying to testnet / mainnet" but addresses are already populated.

**On-chain calls made**: None (this is a utility file). Exports ABIs and helper functions.

**Available contract functions via ABIs**:

Registry (read): `available(name)`, `nameExpires(tokenId)`, `getPrice(name)`, `resolver(tokenId)`, `getName(tokenId)`, `ownerOf(tokenId)`, `balanceOf(owner)`, `tokenURI(tokenId)`

Registry (write): `register(name, domainOwner)`, `renew(tokenId)`, `setResolver(tokenId, resolverAddr)`, `transferFrom(from, to, tokenId)`

Registry (events): `DomainRegistered`, `DomainRenewed`, `Transfer`

Resolver (read): `addr(node)`, `text(node, key)`

Resolver (write): `setAddr(node, newAddr)`, `setText(node, key, value)`

Resolver (events): `AddrChanged`, `TextChanged`

**Key utilities**: `namehash()`, `labelToId()`, `isValidLabel()`, `getPrice()`, `getPriceDisplay()` — all production-ready and tested.

**Notable**: `getPrice()` returns USDC amounts (6 decimals). Pricing: 1-2 chars = $100, 3 chars = $25, 4 chars = $10, 5+ chars = $5.

---

### `src/lib/wagmi.ts` — STATUS: Real

No mock data. Properly defines Arc Testnet chain (id: 5042002) with RPC URL `https://rpc-testnet.arc.network` and creates a Privy-compatible wagmi config.

---

### `src/components/Providers.tsx` — STATUS: Real

No mock data. Sets up the full provider stack: PrivyProvider (with `NEXT_PUBLIC_PRIVY_APP_ID`), QueryClientProvider, WagmiProvider. Configured for Arc Testnet with email + wallet login, embedded wallet creation for users without wallets.

---

### `src/components/Nav.tsx` — STATUS: Real

No mock data. Uses `usePrivy()` for auth state and `login`/`logout`. Displays truncated wallet address from `user?.wallet?.address`. Fully functional.

---

### `src/app/layout.tsx` — STATUS: Real

No mock data. Standard Next.js root layout with fonts, metadata, Providers wrapper, Nav, and footer. The footer text "Powered by decentralized infrastructure" is marketing copy, not data.

---

### `src/app/page.tsx` — STATUS: Partial

**Hardcoded data**: The `FEATURES` array (lines 11-27) is static marketing content — this is intentional and appropriate. However, it imports `PricingSection` which has incorrect pricing (see below).

**On-chain calls**: None needed for this page itself.

---

### `src/components/HeroContent.tsx` — STATUS: Real

No mock data. Renders heading, subtitle, and the SearchBar component with framer-motion animations. Pure marketing/layout component.

---

### `src/components/AuroraBackground.tsx` — STATUS: Real

No mock data. Pure visual animation component with three gradient orbs. No data dependencies.

---

### `src/components/SearchBar.tsx` — STATUS: MOCK (Critical)

**Hardcoded/mocked data**:
- **Lines 38-42**: Availability check is entirely faked. Uses `setTimeout(600ms)` then a deterministic charSum modulo 3 check: `charSum % 3 !== 0` decides if a domain is "available". This has nothing to do with on-chain state.
- **Lines 56-58**: Suggestions when taken are generated client-side by appending `0`, `x`, `-me`, `hq` — no check if those suggestions are actually available.

**On-chain calls made**: ZERO.

**What SHOULD happen**:
1. Call `registry.available(label)` via `useReadContract` to check real availability
2. Optionally check availability of suggestions too
3. Could also call `registry.getPrice(label)` on-chain instead of using the client-side `getPriceDisplay()` (though the client-side version mirrors the contract logic)

---

### `src/components/DomainSearchBar.tsx` — STATUS: Partial

**Hardcoded/mocked data**: None directly — it doesn't attempt an availability check at all. It only validates the label format client-side and navigates to `/register/[label]`.

**On-chain calls made**: ZERO.

**Assessment**: This is an older/simpler version of SearchBar that just does client validation and navigates. Not currently used on any page (SearchBar.tsx is used instead via HeroContent). Could be removed or kept as a secondary lightweight component.

---

### `src/components/PricingSection.tsx` — STATUS: MOCK (Data Conflict)

**Hardcoded/mocked data**:
- **Lines 6-30**: The `TIERS` array shows prices in **ETH** (0.01, 0.05, 0.1, 0.5 ETH) which directly contradicts `contracts.ts` where pricing is in **USDC** ($5, $10, $25, $100 USDC).
- This is a visible data conflict on the landing page. Users see ETH prices on the homepage but USDC prices on the registration page.

**On-chain calls made**: ZERO.

**What SHOULD happen**: Replace the hardcoded `TIERS` array with the correct USDC pricing from `getPriceDisplay()` in contracts.ts. The simplest fix is updating the static data; calling `getPrice()` on-chain is unnecessary since pricing is deterministic based on label length.

---

### `src/app/register/[name]/page.tsx` — STATUS: Real

Server component shell. Extracts and decodes the label, passes to RegisterClient. No data issues.

---

### `src/app/register/[name]/RegisterClient.tsx` — STATUS: MOCK (Critical)

**Hardcoded/mocked data**:
- **Lines 37-43**: Availability check is a `setTimeout(800ms)` with the same charSum % 3 trick. NOT reading from the chain.
- **Lines 47-60**: Registration ("Claim") is a `setTimeout(2000ms)` that jumps straight to "success" with confetti. There is NO:
  - Wallet connection check
  - USDC approval transaction
  - `registry.register(name, owner)` contract call
  - Transaction hash tracking
  - Error handling for failed transactions
  - Gas estimation

**On-chain calls made**: ZERO. The entire registration flow is simulated with timeouts.

**What SHOULD happen (full flow)**:
1. Call `useReadContract` with `registry.available(label)` on mount
2. When user clicks "Claim":
   a. Ensure wallet is connected (prompt Privy login if not)
   b. Call `useReadContract` for `registry.getPrice(label)` to get USDC amount
   c. Call `useWriteContract` for `usdc.approve(registryAddress, price)` — USDC approval
   d. Wait for approval tx confirmation
   e. Call `useWriteContract` for `registry.register(label, userAddress)` — actual registration
   f. Wait for registration tx confirmation
   g. Show real tx hash in TxStatus
   h. On success, show confetti + link to domain management
   i. On error, show real error message

**Missing ABI**: The USDC approval step requires an ERC-20 `approve` ABI entry, which is not in `contracts.ts`. Need to add `approve(address spender, uint256 amount)` and `allowance(address owner, address spender)` for the USDC contract.

---

### `src/app/profile/page.tsx` — STATUS: Real

Server component shell. No data issues.

---

### `src/app/profile/ProfileClient.tsx` — STATUS: MOCK (Critical)

**Hardcoded/mocked data**:
- **Lines 9-14**: `MOCK_DOMAINS` array with three fake domains:
  ```
  { name: 'alice', expires: 'Mar 2027', tokenId: '0xabc123def456' }
  { name: 'dev', expires: 'Jan 2026', tokenId: '0xfed987cba654' }
  { name: 'coolproject', expires: 'Aug 2026', tokenId: '0x111222333444' }
  ```
- Line 92: Domain count shows `MOCK_DOMAINS.length` (hardcoded 3)

**On-chain calls made**:
- `useAccount()` — checks if wallet is connected (real)
- That's it. No domain data is fetched.

**What SHOULD happen**:
1. Call `registry.balanceOf(userAddress)` to get the number of domains owned
2. For each domain, need to enumerate token IDs owned by the user. **Problem**: The ABI does not include `tokenOfOwnerByIndex` (ERC-721 Enumerable). Options:
   a. Add `tokenOfOwnerByIndex` to the ABI if the contract implements ERC-721 Enumerable
   b. Query `Transfer` events to/from the user's address to find all token IDs they hold
   c. Use an indexer/subgraph
3. For each token ID, call `registry.getName(tokenId)` and `registry.nameExpires(tokenId)` to populate card data
4. Show real expiry dates, real token IDs

---

### `src/app/domain/[name]/page.tsx` — STATUS: Real

Server component shell. No data issues. Note: metadata says "on Base" but the app runs on Arc Testnet.

---

### `src/app/domain/[name]/DomainClient.tsx` — STATUS: MOCK (Critical)

**Hardcoded/mocked data**:
- **Lines 14-27**: Entire `MOCK_DOMAIN` object with fake data:
  ```
  owner: '0x1234...5678'
  registered: 'Mar 12, 2025'
  expires: 'Mar 12, 2026'
  records: { eth, url, twitter, github, email, description, avatar }
  ```
- **Lines 91-104**: Record editing (`saveEdit`) only updates React state. No on-chain write.
- **Line 283**: Edit mode footer explicitly says "In production, changes are submitted as transactions to the resolver contract."

**On-chain calls made**: ZERO.

**What SHOULD happen**:
1. **Domain info**:
   - `registry.ownerOf(tokenId)` to get owner address (tokenId from `labelToId(label)`)
   - `registry.nameExpires(tokenId)` to get expiry timestamp
   - Registration date could come from `DomainRegistered` event logs or be calculated from expiry - 1 year
2. **Records (read)**:
   - `resolver.addr(namehash(label))` to get ETH address record
   - `resolver.text(namehash(label), 'url')` for each text record key
   - Need to call for each key in `TEXT_RECORD_KEYS`: avatar, url, email, twitter, github, description
3. **Records (write)**:
   - `resolver.setAddr(namehash(label), newAddr)` via `useWriteContract`
   - `resolver.setText(namehash(label), key, value)` via `useWriteContract`
4. **Ownership check**: Only show edit button if `ownerOf(tokenId) === connectedAddress`
5. **Renew button**: Should call `registry.renew(tokenId)` (with USDC payment) instead of linking to register page

---

### `src/components/DomainCard.tsx` — STATUS: Partial

**Hardcoded/mocked data**: None in this component itself. It's a pure presentational component that receives `name`, `expires`, and `tokenId` as props.

**Issue**: It receives mock data from its parent (`ProfileClient.tsx`). The component will work correctly once the parent feeds it real data.

---

### `src/components/RecentRegistrations.tsx` — STATUS: MOCK (Not in use)

**Hardcoded/mocked data**:
- **Lines 16-23**: `PLACEHOLDER_DOMAINS` array with 6 fake domain registrations (alice, bob, claw, degen, base, satoshi) with fake owner addresses and a hardcoded expiry timestamp.
- **Line 12**: Has an explicit TODO: "Replace static placeholders with actual event indexing once contracts are deployed."

**On-chain calls made**:
- `useChainId()` — checks current chain (real)
- Reads `CONTRACT_ADDRESSES` to check if registry is deployed (real check)
- Shows a yellow warning banner when contracts appear undeployed

**Not currently used**: This component is not imported or rendered on any page. It was likely part of an earlier design.

**What SHOULD happen**: Query `DomainRegistered` events from the registry contract using `getLogs` or `useWatchContractEvent`, sorted by block number descending, limited to recent N entries.

---

### `src/components/AddressDisplay.tsx` — STATUS: Real

No mock data. Pure presentational component that truncates addresses and provides copy-to-clipboard. Ready for production use.

---

### `src/components/RecordRow.tsx` — STATUS: Real

No mock data. Pure presentational component for displaying a single record with copy and edit actions. Ready for production use.

---

### `src/components/TxStatus.tsx` — STATUS: Real (but unused properly)

No mock data. Pure state machine for showing tx progress (pending, confirming, success, error). The component is well-built but never connected to real transaction state. Currently `RegisterClient.tsx` feeds it hardcoded states via `setTimeout`.

**What SHOULD happen**: TxStatus should receive a real transaction hash and use `useWaitForTransactionReceipt` to track confirmation state.

---

## Data Sources Needed

### 1. Domain Availability Check
- **Source**: On-chain call to `registry.available(label)`
- **Used by**: SearchBar, RegisterClient
- **Approach**: `useReadContract` with debounce. No indexer needed.

### 2. Domain Registration
- **Source**: On-chain write: `usdc.approve()` then `registry.register()`
- **Used by**: RegisterClient
- **Approach**: `useWriteContract` + `useWaitForTransactionReceipt`. Needs ERC-20 ABI for USDC approve/allowance.

### 3. User's Owned Domains (Profile Page)
- **Source**: This is the hardest problem. Options:
  - **Option A — ERC-721 Enumerable**: If the contract implements `tokenOfOwnerByIndex(address, index)` and `tokenByIndex(index)`, call `balanceOf(address)` then loop `tokenOfOwnerByIndex` for each. Requires these functions in the ABI (currently missing).
  - **Option B — Event Indexing**: Query all `Transfer` events where `to === userAddress` and subtract those where `from === userAddress`. Requires scanning from contract deployment block. Feasible for small number of events but gets expensive as the chain grows.
  - **Option C — Subgraph/Indexer**: Deploy a subgraph or use an indexing service to track domain ownership. Most scalable but adds infrastructure dependency.
  - **Recommendation for MVP**: Try Option A first. If the contract has Enumerable, it's the simplest. If not, use Option B with a reasonable block range. Consider caching results in React Query.
- **Used by**: ProfileClient

### 4. Domain Details (Owner, Expiry)
- **Source**: On-chain calls to `registry.ownerOf(tokenId)` and `registry.nameExpires(tokenId)`
- **Used by**: DomainClient
- **Approach**: `useReadContract` for each. tokenId comes from `labelToId(label)`.

### 5. Resolver Records (Text Records + ETH Address)
- **Source**: On-chain calls to `resolver.addr(node)` and `resolver.text(node, key)` for each key
- **Used by**: DomainClient
- **Approach**: Multiple `useReadContract` calls or `useReadContracts` (multicall) for efficiency. `node = namehash(label)`.

### 6. Record Updates
- **Source**: On-chain writes to `resolver.setAddr(node, addr)` and `resolver.setText(node, key, value)`
- **Used by**: DomainClient (edit mode)
- **Approach**: `useWriteContract` + confirmation tracking. Must check ownership first.

### 7. Domain Renewal
- **Source**: On-chain write to `registry.renew(tokenId)` (presumably requires USDC payment)
- **Used by**: DomainClient (renew button)
- **Approach**: Same USDC approve + renew pattern as registration.

### 8. Recent Registrations
- **Source**: `DomainRegistered` event logs from the registry contract
- **Used by**: RecentRegistrations (currently unused)
- **Approach**: `useContractEvent` or `getLogs` with `fromBlock: 'latest' - N`. For a live feed, use `useWatchContractEvent`. No indexer strictly needed for "last N" registrations, but an indexer would be better for pagination.

### 9. Registration Date
- **Source**: `DomainRegistered` event for the specific tokenId, or calculate as `expires - 365 days`
- **Used by**: DomainClient
- **Approach**: Query specific event log by tokenId, or derive from expiry.

---

## Every On-Chain Interaction: Current vs. Needed

### Currently Made (Real)
| Interaction | Component | How |
|---|---|---|
| Check wallet connection | Nav, ProfileClient | `useAccount()`, `usePrivy()` |
| Get chain ID | RecentRegistrations | `useChainId()` |
| Wallet login/logout | Nav | `usePrivy().login()` / `logout()` |

**That's it. Only 3 real on-chain/wallet interactions exist, and none of them read or write contract data.**

### Needed But Not Implemented

| Interaction | Component | Contract Call | Priority |
|---|---|---|---|
| Check domain availability | SearchBar, RegisterClient | `registry.available(label)` | **P0** |
| Get registration price | RegisterClient | `registry.getPrice(label)` | P1 (client-side version exists) |
| Approve USDC spend | RegisterClient | `usdc.approve(registry, amount)` | **P0** |
| Check USDC allowance | RegisterClient | `usdc.allowance(user, registry)` | P1 |
| Register domain | RegisterClient | `registry.register(label, owner)` | **P0** |
| Get domain owner | DomainClient | `registry.ownerOf(tokenId)` | **P0** |
| Get domain expiry | DomainClient | `registry.nameExpires(tokenId)` | **P0** |
| Get ETH address record | DomainClient | `resolver.addr(node)` | **P0** |
| Get text records | DomainClient | `resolver.text(node, key)` x6 | **P0** |
| Set ETH address record | DomainClient | `resolver.setAddr(node, addr)` | **P0** |
| Set text records | DomainClient | `resolver.setText(node, key, value)` | **P0** |
| Get user's domain count | ProfileClient | `registry.balanceOf(address)` | **P0** |
| Enumerate user's domains | ProfileClient | Events or Enumerable | **P0** |
| Get domain name from ID | ProfileClient | `registry.getName(tokenId)` | **P0** |
| Renew domain | DomainClient | `registry.renew(tokenId)` | P1 |
| Track tx confirmation | RegisterClient, DomainClient | `useWaitForTransactionReceipt` | **P0** |
| Get recent registrations | RecentRegistrations | `DomainRegistered` event logs | P2 |
| Check USDC balance | RegisterClient | `usdc.balanceOf(user)` | P1 |

### Missing ABI Entries Needed

The following are needed in `contracts.ts` but not present:

1. **ERC-20 (USDC)** — needs its own ABI:
   - `approve(address spender, uint256 amount)`
   - `allowance(address owner, address spender)`
   - `balanceOf(address account)`
   - `Approval` event

2. **ERC-721 Enumerable** (if supported by registry):
   - `tokenOfOwnerByIndex(address owner, uint256 index)`
   - `totalSupply()`

---

## Other Issues Found

1. **Pricing data conflict**: `PricingSection.tsx` shows ETH prices, `contracts.ts` defines USDC prices. The homepage tells users one price, the register page tells them another.

2. **Metadata says "on Base"**: `register/[name]/page.tsx` line 14 says "on Base" but the app uses Arc Testnet. Same in `domain/[name]/page.tsx` line 15.

3. **DomainSearchBar.tsx is unused**: The older search bar component with dark theme styling is not imported anywhere. Either integrate it or remove it.

4. **RecentRegistrations.tsx is unused**: Component exists with placeholder data but isn't rendered on any page.

5. **Renew button links to register page**: In `DomainClient.tsx` line 198-201, the "Renew domain" button links to `/register/${label}` which would try to re-register the domain instead of renewing it.

6. **No ownership gating on edit**: `DomainClient.tsx` shows the "Edit domain" button to everyone, not just the domain owner. Without on-chain ownership checks, anyone can toggle edit mode (though edits currently only affect local state).

7. **Trust strip claim**: HeroContent says "Trusted by builders" — this is marketing copy that may need substantiation or removal.

8. **No USDC balance check**: Before registration, there's no check whether the user actually has enough USDC to pay.
