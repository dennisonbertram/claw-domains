# .claw Domains — Frontend Implementation

## Summary

Complete Next.js 14 (App Router) frontend for the .claw domain service, located at `/Users/dennisonbertram/Develop/claw-domains/web/`. The app compiles cleanly with `npm run build`.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | App Router, SSR/SSG |
| React | 19 | UI framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | v4 | Styling |
| wagmi | v2 | Blockchain hooks |
| viem | v2 | Ethereum utilities, ABI encoding |
| ConnectKit | 1.9.x | Wallet connect modal |
| @tanstack/react-query | v5 | Server state / caching |

## Directory Structure

```
web/src/
├── app/
│   ├── layout.tsx              — Root layout: Providers + Nav + footer
│   ├── page.tsx                — Home: hero, search, features, recent registrations
│   ├── globals.css             — Dark theme base styles
│   ├── domain/[name]/
│   │   ├── page.tsx            — Server shell (metadata generation)
│   │   └── DomainClient.tsx    — Full domain profile + owner edit panel
│   ├── register/[name]/
│   │   ├── page.tsx            — Server shell (metadata generation)
│   │   └── RegisterClient.tsx  — Availability check + registration flow
│   └── profile/
│       ├── page.tsx            — Server shell
│       └── ProfileClient.tsx   — My Domains list (event log querying)
├── components/
│   ├── Providers.tsx           — WagmiProvider + QueryClientProvider + ConnectKitProvider
│   ├── Nav.tsx                 — Sticky navbar: logo, search, wallet button
│   ├── DomainSearchBar.tsx     — Reusable search bar with validation + price hint
│   ├── TxStatus.tsx            — Transaction state display (pending/confirming/success/error)
│   ├── AddressDisplay.tsx      — Truncated address with copy-to-clipboard
│   └── RecentRegistrations.tsx — Recent domains grid (placeholder until contracts deployed)
└── lib/
    ├── contracts.ts            — ABIs, addresses, namehash(), labelToId(), getPrice()
    └── wagmi.ts                — wagmi config with Base + Base Sepolia chains
```

## Key Decisions

### Namehash Implementation

Matches `ClawNamehash.sol` exactly using viem's `keccak256` and `encodePacked`:

```ts
// matches: keccak256(abi.encodePacked(node, keccak256("claw")))
// then:    keccak256(abi.encodePacked(node, keccak256(label)))
export function namehash(label: string): `0x${string}` {
  let node = toHex(0n, { size: 32 })
  const clawHash = keccak256(encodePacked(['string'], ['claw']))
  node = keccak256(encodePacked(['bytes32', 'bytes32'], [node, clawHash]))
  const labelHash = keccak256(encodePacked(['string'], [label]))
  node = keccak256(encodePacked(['bytes32', 'bytes32'], [node, labelHash]))
  return node
}
```

The tokenId passed to registry functions is `uint256(namehash(label))`.
The `node` (bytes32) passed to resolver functions is `namehash(label)`.

### Contract Addresses

All addresses are set to `0x000...000` with `// TODO: deploy` comments in `/src/lib/contracts.ts`. The UI gracefully degrades — showing yellow banners when contracts are not deployed, disabling all write actions.

### Pricing (matches Solidity constants)

| Length | Price |
|--------|-------|
| 1-2 chars | 0.5 ETH |
| 3 chars | 0.1 ETH |
| 4 chars | 0.05 ETH |
| 5+ chars | 0.01 ETH |

### Profile / "My Domains" (event-based discovery)

`ProfileClient.tsx` creates a `viem` `PublicClient` and queries `Transfer` event logs filtered to the connected wallet's address, then calls `ownerOf` + `getName` + `nameExpires` per token. This will work once contracts are deployed; the current state shows an empty list with a "Register" CTA.

### ConnectKit React 19 Compatibility

ConnectKit 1.9.x declares `react@"17.x || 18.x"` as a peer dependency. React 19 is installed. The package was installed with `--legacy-peer-deps`. ConnectKit functions correctly at runtime despite the peer dep mismatch.

## Pages

### `/` — Home

- Hero section with animated gradient text
- `DomainSearchBar` with hero mode (larger input, auto-focus)
- Pricing tier pill badges
- Feature cards (On Base / Fully Yours / Rich Profiles)
- `RecentRegistrations` grid showing placeholder domains until contracts are deployed

### `/register/[name]` — Registration

Flow:
1. Validates label format client-side
2. Calls `available(name)` via `useReadContract`
3. If available: shows price, 1-year duration, "Register" button
4. If taken: shows owner address + expiry, link to domain profile
5. On register click: `writeContract({ functionName: 'register', value: price })`
6. `TxStatus` component shows pending → confirming → success
7. Success state shows links to domain profile and my domains

### `/domain/[name]` — Domain Profile

Sections:
- Domain header: name, active/expired badge, owner, expiry, token ID, resolver
- Records: ETH address + all text records (avatar, url, email, twitter, github, description)
- Owner panel (only visible to wallet that owns the domain):
  - Set Resolver (if resolver not yet set)
  - Edit ETH Address
  - Edit Text Records (key selector + value input)
  - Transfer Domain (with confirmation warning, reversible-warning)

### `/profile` — My Domains

- Lists all .claw domains owned by connected wallet
- Uses `viem` getLogs with `Transfer` event to discover token IDs
- Shows expiry status, Manage and Renew buttons per domain

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Get a free WalletConnect project ID at https://cloud.walletconnect.com.

## Next Steps

1. **Deploy contracts** to Base Sepolia testnet
2. **Update contract addresses** in `/src/lib/contracts.ts`
3. **Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`** in `.env.local`
4. **Test registration flow** end-to-end on Base Sepolia
5. **Add an indexer** (e.g., The Graph or simple backend) for `RecentRegistrations` pulling live event data
6. **Add renew flow** — `ProfileClient` has a Renew button linking back to `/register/[name]`; the register page could detect if the wallet already owns the domain and show a renew CTA instead

## Build Output

```
Route (app)
├ ○ /
├ ○ /_not-found
├ ƒ /domain/[name]
├ ○ /profile
└ ƒ /register/[name]

○ (Static)   prerendered as static content
ƒ (Dynamic)  server-rendered on demand
```

Build passes with `npm run build` — zero TypeScript errors, zero ESLint errors.
