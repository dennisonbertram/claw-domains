# Research: Privy.io Wallet Integration

**Date**: 2026-03-14
**Author**: Research agent
**Context**: Evaluating Privy as a wallet connection layer for the Claw Domains web app (Arc Network, chain ID 5042002, USDC as native gas token)

---

## 1. What Is Privy?

Privy (privy.io) is a wallet infrastructure platform that sits one level above raw wagmi/viem. Where ConnectKit and RainbowKit are React UI component libraries that let users connect *existing* wallets to a dApp, Privy goes further by:

- **Creating wallets for users who don't have one** — embedded, self-custodial wallets generated at signup using Trusted Execution Environments (TEEs), no seed phrase required
- **Supporting every major login method** — email OTP, SMS OTP, Google, Apple, Twitter/X, Discord, GitHub, LinkedIn, Spotify, Instagram, Telegram, TikTok, Farcaster, and direct wallet connection
- **Acting as a full auth layer** — Privy replaces your app's authentication system, not just the wallet picker

### vs. ConnectKit / RainbowKit

| Concern | ConnectKit / RainbowKit | Privy |
|---|---|---|
| Target user | Crypto-native, already has a wallet | Anyone — crypto-native or not |
| Auth layer | None (you bring your own) | Built-in (replaces Auth0-style auth) |
| Embedded wallets | No | Yes — creates wallets for new users |
| Login methods | Wallet only | Email, SMS, social, wallet |
| Wagmi compatibility | Built on wagmi | Wraps wagmi via `@privy-io/wagmi` |
| Setup complexity | Low | Moderate (more config surface) |
| Pricing | Free (open source) | Free up to 500 MAU, then paid |

**Summary**: ConnectKit/RainbowKit are wallet pickers. Privy is a wallet picker + user onboarding + embedded wallet creation system. If your users are expected to already have MetaMask or Rabby, ConnectKit is simpler. If you want to onboard non-crypto users, Privy is the tool.

---

## 2. Key Features

### Embedded Wallets
Privy creates self-custodial EVM wallets for users without any wallet on login. Keys are sharded using TEEs — Privy never sees the full private key, and neither does the app developer. The user can export their key at any time.

Configuration option `createOnLogin: 'users-without-wallets'` automatically provisions an embedded wallet for any new user who signs in via email, social, or SMS.

### External Wallet Connection
All browser extension wallets (MetaMask, Rabby, Coinbase Wallet, Rainbow, etc.), hardware wallets, and mobile wallet apps can be connected in addition to — or instead of — the embedded wallet.

### Smart Wallets
Privy supports ERC-4337 smart accounts out of the box via integration with account abstraction infra (Pimlico, Alchemy, etc.). This is optional and relevant if you want gasless transactions or batched calls. Not needed for MVP.

### Login Methods (full list)
`email`, `sms`, `wallet`, `google`, `apple`, `twitter`, `discord`, `github`, `linkedin`, `spotify`, `instagram`, `telegram`, `tiktok`, `farcaster`

All are toggle-enabled in the Privy Dashboard. OAuth providers use Privy's default OAuth credentials or your own.

### Wagmi Compatibility
Privy ships `@privy-io/wagmi`, a thin wrapper over wagmi that synchronizes Privy's wallet state with wagmi's `useAccount`, `useSendTransaction`, `useReadContract`, etc. You write standard wagmi hooks — Privy handles the plumbing.

---

## 3. Next.js Integration

### Installation

```bash
npm install @privy-io/react-auth @privy-io/wagmi wagmi viem @tanstack/react-query
```

### Provider Stack

The required nesting order (outermost to innermost):

```tsx
// app/providers.tsx
'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig } from '@privy-io/wagmi';
import { http } from 'viem';
import { arcTestnet } from '../lib/chains'; // custom chain — see section 4

const wagmiConfig = createConfig({
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="your-privy-app-id"
      config={{
        defaultChain: arcTestnet,
        supportedChains: [arcTestnet],
        loginMethods: ['email', 'wallet', 'google'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        appearance: {
          theme: 'dark',
          accentColor: '#your-brand-color',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
```

Key point: import `WagmiProvider` and `createConfig` from `@privy-io/wagmi`, **not** from `wagmi` directly. This is required for Privy's wallet state to sync with wagmi.

### Initialization Check

Always wait for `ready` before rendering auth-dependent UI:

```tsx
import { usePrivy } from '@privy-io/react-auth';

function App() {
  const { ready, authenticated } = usePrivy();
  if (!ready) return <div>Loading...</div>;
  if (!authenticated) return <LoginButton />;
  return <Dashboard />;
}
```

### Login / Logout

```tsx
import { useLogin, usePrivy } from '@privy-io/react-auth';

function LoginButton() {
  const { login } = useLogin();
  const { logout, user } = usePrivy();

  return authenticated
    ? <button onClick={logout}>Disconnect</button>
    : <button onClick={login}>Connect / Sign In</button>;
}
```

`useLogin()` opens Privy's modal, which shows whatever login methods you've configured.

---

## 4. Custom Chain Support — Arc Network

Arc Network is not in `viem/chains`. Use viem's `defineChain`:

```tsx
// lib/chains.ts
import { defineChain } from 'viem';

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: {
    decimals: 6,          // USDC has 6 decimals
    name: 'USD Coin',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.arc-testnet.example.com'],  // replace with actual RPC
      webSocket: ['wss://rpc.arc-testnet.example.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arc Explorer',
      url: 'https://explorer.arc-testnet.example.com',  // replace with actual
    },
  },
  testnet: true,
});
```

Then pass to both PrivyProvider and wagmi's `createConfig`:

```tsx
// PrivyProvider config
config={{
  defaultChain: arcTestnet,
  supportedChains: [arcTestnet],
  ...
}}

// wagmi createConfig
const wagmiConfig = createConfig({
  chains: [arcTestnet],
  transports: { [arcTestnet.id]: http('https://rpc.arc-testnet.example.com') },
});
```

**USDC as native gas**: The `nativeCurrency` block represents what Arc uses as gas. Since Arc uses USDC as native gas, set `decimals: 6`, `symbol: 'USDC'`. This affects how Privy and wagmi display gas estimates in their UIs. The contract interaction pattern does not change — native token transfers use `eth_sendTransaction` with a `value` field regardless of the token symbol.

**PrivyProvider validation rules**:
- `supportedChains` cannot be an empty array
- `defaultChain` must appear in `supportedChains`
- Violating either throws at runtime

---

## 5. ERC-20 Token Approval Flow

Since USDC is the *native gas token* on Arc, and the domain registration contract likely accepts USDC payment, the flow depends on how the contract is built:

### Case A: Contract accepts native token (USDC as gas = native value transfer)

No `approve` needed. Just send a transaction with `value`:

```tsx
import { useSendTransaction } from 'wagmi';
import { parseUnits } from 'viem';

const { sendTransaction } = useSendTransaction();

sendTransaction({
  to: REGISTRY_CONTRACT_ADDRESS,
  value: parseUnits('5', 6), // 5 USDC (6 decimals)
  data: encodeFunctionData({ abi, functionName: 'register', args: [name, owner] }),
});
```

### Case B: Contract accepts USDC as an ERC-20 token (separate token contract)

If there is a separate USDC ERC-20 contract address on Arc and the registry contract pulls USDC via `transferFrom`, then you need approve + call:

```tsx
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { erc20Abi, parseUnits } from 'viem';

const { writeContract } = useWriteContract();

// Step 1: approve
const approveTx = await writeContract({
  address: USDC_CONTRACT_ADDRESS,
  abi: erc20Abi,
  functionName: 'approve',
  args: [REGISTRY_CONTRACT_ADDRESS, parseUnits('5', 6)],
});

// Step 2: register (after approval confirms)
const registerTx = await writeContract({
  address: REGISTRY_CONTRACT_ADDRESS,
  abi: registryAbi,
  functionName: 'register',
  args: [name, owner, duration],
});
```

Privy's embedded wallet will prompt the user to sign each transaction via its own UI. For external wallets (MetaMask, etc.), the native wallet popup handles it. The wagmi hooks work identically for both wallet types — Privy abstracts the difference.

### Multi-wallet Handling

If the user has both an embedded wallet and a connected external wallet, use `useSetActiveWallet` from `@privy-io/wagmi` to select which wallet signs:

```tsx
import { useWallets } from '@privy-io/react-auth';
import { useSetActiveWallet } from '@privy-io/wagmi';

const { wallets } = useWallets();
const { setActiveWallet } = useSetActiveWallet();

// Switch to external wallet
const externalWallet = wallets.find(w => w.walletClientType !== 'privy');
if (externalWallet) await setActiveWallet(externalWallet);
```

---

## 6. Pricing

| Tier | MAU Range | Monthly Cost | Notes |
|---|---|---|---|
| Free | 0–499 | $0 | All core features, 50K signatures/mo, $1M tx volume/mo |
| Core | 500–2,499 | $299/mo | — |
| Scale | 2,500–9,999 | $499/mo | — |
| Enterprise | 10K+ MAU or >50K signatures/mo | Custom | SLAs, webhooks, SSO, compliance |

**Free tier is generous for MVP**: 500 MAU is a reasonable ceiling for early launch. The 50K signatures/month and $1M transaction volume limits on the free tier are unlikely to be hit at MVP scale.

**Stripe acquisition context**: Privy was acquired by Stripe in June 2025. Privy continues to operate as an independent product. The acquisition signals long-term stability and potential future Stripe/fiat payment integrations, but the current product and pricing are unchanged.

---

## 7. Comparison to Current Wagmi + ConnectKit Setup

The app currently uses wagmi + ConnectKit. Here's what changes and what's added with Privy:

### What Privy Replaces
- ConnectKit's wallet picker UI → Privy's modal (similar UX, more options)
- Manual wallet-only auth flow → Privy handles auth state (ready, authenticated, user object)

### What Privy Adds That ConnectKit Cannot Do
1. **Embedded wallets**: Users who have never used crypto can sign up with email and get a wallet automatically. This is the biggest UX unlock.
2. **Email / SMS / social login**: Login with Google, email OTP, etc. — these don't exist in ConnectKit.
3. **Auth layer**: `authenticated`, `user`, `login`, `logout` — Privy provides a full auth context, eliminating the need for a separate session/auth system for Web3 apps.
4. **Cross-app wallets**: Privy wallets can be exported and used in other Privy-powered apps.

### What Stays the Same
- All wagmi hooks (`useAccount`, `useReadContract`, `useWriteContract`, `useSendTransaction`, etc.) work exactly as before — just import from `wagmi`
- viem chain definitions work the same
- Contract interaction code does not change

### Migration Path from ConnectKit
1. Remove `connectkit` and `connectkit-next-siwe`
2. Install `@privy-io/react-auth`, `@privy-io/wagmi`
3. Replace `ConnectKitProvider` with `PrivyProvider` + `WagmiProvider` from `@privy-io/wagmi`
4. Replace `ConnectKitButton` with a button that calls `login()` from `useLogin()`
5. Existing contract interaction code needs no changes

---

## 8. Full Next.js Setup Example

### File: `lib/chains.ts`

```ts
import { defineChain } from 'viem';

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: {
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.arc-testnet.example.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arc Explorer',
      url: 'https://explorer.arc-testnet.example.com',
    },
  },
  testnet: true,
});
```

### File: `app/providers.tsx`

```tsx
'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { arcTestnet } from '../lib/chains';

const wagmiConfig = createConfig({
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        defaultChain: arcTestnet,
        supportedChains: [arcTestnet],
        loginMethods: ['email', 'wallet', 'google'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        appearance: {
          theme: 'dark',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
```

### File: `app/layout.tsx`

```tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### File: `components/ConnectButton.tsx`

```tsx
'use client';

import { usePrivy, useLogin } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';

export function ConnectButton() {
  const { ready, authenticated, logout } = usePrivy();
  const { login } = useLogin();
  const { address } = useAccount();

  if (!ready) return null;

  if (!authenticated) {
    return <button onClick={login}>Connect Wallet</button>;
  }

  return (
    <div>
      <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
      <button onClick={logout}>Disconnect</button>
    </div>
  );
}
```

### File: `components/RegisterDomain.tsx` (contract interaction, unchanged pattern)

```tsx
'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { registryAbi } from '../lib/abi';
import { REGISTRY_ADDRESS } from '../lib/constants';

export function RegisterDomain({ name }: { name: string }) {
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const handleRegister = () => {
    writeContract({
      address: REGISTRY_ADDRESS,
      abi: registryAbi,
      functionName: 'register',
      args: [name],
      value: parseUnits('5', 6), // 5 USDC as native gas value (if contract takes native)
    });
  };

  return (
    <button onClick={handleRegister} disabled={isPending || isConfirming}>
      {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : `Register ${name}.claw`}
    </button>
  );
}
```

---

## 9. Open Questions / Items to Verify

1. **Arc RPC endpoint**: The actual RPC URL for Arc testnet needs to be confirmed and added to `lib/chains.ts`.
2. **Arc block explorer**: Confirm the block explorer URL for Arc testnet.
3. **USDC native vs. ERC-20**: Confirm whether the domain registry contract takes native token `value` or calls `transferFrom` on a USDC ERC-20 contract. This determines whether an `approve` step is needed.
4. **Privy app ID**: Requires creating a project at dashboard.privy.io and adding `NEXT_PUBLIC_PRIVY_APP_ID` to `.env.local`.
5. **Embedded wallet key export**: Privy embedded wallets let users export private keys. Confirm this is acceptable for the Claw Domains UX.
6. **Post-Stripe acquisition**: Monitor any Privy pricing or API changes as the Stripe integration deepens.

---

## Sources

- [Privy Docs — Wallet Overview](https://docs.privy.io/wallets/overview)
- [Privy Docs — EVM Network Configuration](https://docs.privy.io/guide/react/configuration/networks/evm)
- [Privy Docs — React Setup](https://docs.privy.io/basics/react/setup)
- [Privy Docs — wagmi Integration](https://docs.privy.io/guide/react/wallets/usage/wagmi)
- [Privy Docs — Login Methods](https://docs.privy.io/guide/react/configuration/login-methods)
- [Privy Docs — EVM Transaction Requests](https://docs.privy.io/guide/react/wallets/usage/evm/requests)
- [Privy Pricing](https://www.privy.io/pricing)
- [Privy — Embedded Wallets 101](https://www.privy.io/embedded-wallets-101)
- [Stripe Acquires Privy — CoinDesk](https://www.coindesk.com/business/2025/06/11/stripe-to-acquire-crypto-wallet-startup-privy-in-bid-to-expand-web3-capabilities)
- [Privy Blog — Stripe Acquisition Announcement](https://privy.io/blog/announcing-our-acquisition-by-stripe)
- [npm: @privy-io/react-auth](https://www.npmjs.com/package/@privy-io/react-auth)
