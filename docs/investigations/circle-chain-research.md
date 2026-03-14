# Circle's Blockchain: Arc — Research Findings

**Research Date:** 2026-03-14
**Status:** Testnet live (October 2025); Mainnet planned for 2026

---

## 1. Name and Branding

**Arc** — officially stylized as "Arc" with the tagline "The Economic OS."

- Website: https://www.arc.network/
- X/Twitter: @Arc (separate handle from @circle)
- Announced by Circle in September 2025; public testnet launched October 28, 2025
- Circle refers to Arc as "an open Layer-1 blockchain purpose-built for stablecoin finance"

---

## 2. Current Status

**Testnet only** as of March 2026.

- Public testnet launched: **October 28, 2025**
- Testnet stats (as of January 2026): 150M+ transactions in first 90 days, ~1.5M active wallets, ~0.5s average settlement
- Mainnet: **Planned for 2026** (no specific date announced as of Q4 2025 earnings call, Feb 2026)
- Circle CEO Jeremy Allaire confirmed mainnet is on track for 2026; native ARC token exploration is in early stages
- Over 200+ institutional participants on testnet, including BlackRock, Visa, Mastercard, Goldman Sachs, Deutsche Bank, HSBC, Anthropic, AWS, Coinbase, Kraken

---

## 3. Chain ID

| Network       | Chain ID  | Hex        |
|---------------|-----------|------------|
| Arc Testnet   | 5042002   | 0x4cef52   |
| Arc Mainnet   | Not yet assigned (mainnet not live) |

---

## 4. RPC URLs

### Testnet

| Provider   | RPC URL                              |
|------------|--------------------------------------|
| Official   | https://rpc.testnet.arc.network      |
| dRPC       | https://arc-testnet.drpc.org         |
| dRPC WSS   | wss://arc-testnet.drpc.org           |
| thirdweb   | https://5042002.rpc.thirdweb.com     |
| Alchemy    | https://arc-testnet.g.alchemy.com/v2/{key} |
| QuickNode  | Available (see docs.quicknode.com/docs/arc) |

### Mainnet

Not yet available.

---

## 5. Gas Token

**USDC** is the native gas token.

This is Arc's most distinctive feature: instead of a volatile cryptocurrency (like ETH), you pay all gas fees in USDC. There is no separate "ARC" token required for gas (though Circle is exploring a native ARC token for governance/other purposes — still in early exploratory phase as of Feb 2026).

- Gas costs: approximately **$0.009 per transaction** on testnet
- Fee model is based on EIP-1559 architecture but uses an **exponentially weighted moving average** to smooth fee spikes, keeping fees stable and dollar-denominated
- Fees go to an on-chain Arc Treasury

---

## 6. USDC Availability

USDC is natively available — it is the foundational asset of Arc.

### Testnet Contract Addresses

| Asset                  | Contract Address                             |
|------------------------|----------------------------------------------|
| USDC (native)          | `0x3600000000000000000000000000000000000000`  |
| EURC                   | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`  |
| USYC                   | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C`  |
| CCTP TokenMessengerV2  | `0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA`  |
| CCTP MessageTransmitterV2 | `0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275` |
| Gateway Wallet         | `0x0077777d7EBA4688BDeF3E311b846F25870A19B9`  |
| FxEscrow (Payments)    | `0x867650F5eAe8df91445971f14d89fd84F0C9a9f8`  |
| Permit2                | `0x000000000022D473030F116dDEE9F6B43aC78BA3`  |
| Multicall3             | `0xcA11bde05977b3631167028862bE2a173976CA11`  |

Note: USDC at the `0x36000...` address exposes an optional ERC-20 interface for interacting with the native USDC balance (6 decimals). This is unusual — USDC is baked into the protocol layer, not just an ERC-20 contract.

**Faucet:** https://faucet.circle.com — 1 USDC/day limit per wallet address, select "Arc Testnet"

**CCTP:** Circle's Cross-Chain Transfer Protocol is natively integrated for bridging USDC between Arc and other chains.

---

## 7. EVM Compatibility

**Yes — fully EVM-compatible.**

- Solidity contracts deploy as-is using standard tooling (Hardhat, Foundry, Remix, Thirdweb)
- Same JSON-RPC interface as Ethereum
- MetaMask, ethers.js, viem, web3.js all work without modification
- Supports ERC-20, ERC-721, ERC-1155, ERC-4337 (account abstraction), and other standard Ethereum contract interfaces
- Only caveat: USDC is the gas token (not ETH), so scripts that assume ETH as gas need adjustment — you fund wallets with USDC, not ETH

---

## 8. Gas Costs

- **Typical transaction:** ~$0.009 USDC (less than 1 cent)
- **Fee model:** EIP-1559-inspired with weighted moving average smoothing — fees are predictable and dollar-denominated
- **Deployment costs:** Not explicitly published; expected to be a few cents to low dollars given the sub-cent per-tx baseline
- **No ETH exposure:** Since gas is paid in USDC, developers and businesses can budget gas as a fixed dollar line item
- **Performance:** ~3,000 TPS, finality under 350ms with 20 validators

---

## 9. Block Explorer

| Network        | Explorer URL                         |
|----------------|--------------------------------------|
| Arc Testnet    | https://testnet.arcscan.app/         |
| Arc Mainnet    | Not yet live                         |

Note: Blockscout is the technology underlying the Arc explorer (confirmed by Blockscout's own blog post "The ARC of Innovation").

---

## 10. Wallet Support

**MetaMask:** Supported — add as custom network using the RPC/Chain ID details above.

**Other confirmed wallet support on testnet:**
- MetaMask
- Coinbase Wallet (Coinbase is a testnet participant)
- Fireblocks (institutional)
- Ledger
- Rainbow
- Exodus
- Privy
- Turnkey
- Bron
- Vultisig

For MetaMask, add manually:
- Network Name: Arc Testnet
- RPC URL: https://rpc.testnet.arc.network
- Chain ID: 5042002
- Currency Symbol: USDC
- Block Explorer: https://testnet.arcscan.app/

---

## 11. Developer Docs

| Resource               | URL                                          |
|------------------------|----------------------------------------------|
| Main docs              | https://docs.arc.network/                    |
| Welcome/concepts       | https://docs.arc.network/arc/concepts/welcome-to-arc |
| Deploy on Arc tutorial | https://docs.arc.network/arc/tutorials/deploy-on-arc |
| Contract addresses     | https://docs.arc.network/arc/references/contract-addresses |
| Arc website/blog       | https://www.arc.network/                     |
| Circle press release   | https://www.circle.com/pressroom/circle-launches-arc-public-testnet |
| Circle blog            | https://www.circle.com/blog/introducing-arc-an-open-layer-1-blockchain-purpose-built-for-stablecoin-finance |

---

## 12. What Makes Arc Unique vs. Base / Optimism / Arbitrum

### Structural Difference

Arc is a **sovereign Layer 1**, not a Layer 2 rollup. Base, Optimism, and Arbitrum all inherit Ethereum's security and post data/proofs back to Ethereum mainnet. Arc stands alone — its own consensus, its own validator set, its own finality.

### Key Differentiators

| Feature | Arc | Base / Optimism / Arbitrum |
|---------|-----|---------------------------|
| Gas token | USDC (stablecoin) | ETH (volatile) |
| Layer | L1 (sovereign) | L2 (on top of Ethereum) |
| Finality | Deterministic, ~350ms | Minutes to hours (challenge windows for optimistic rollups) |
| Fee volatility | Near-zero (USDC-denominated, smoothed) | Varies with ETH price and L1 gas |
| Built-in FX | Yes (stablecoin FX engine / StableFX) | No |
| Privacy | Opt-in shielded txs | No native privacy |
| USDC | Native protocol asset | ERC-20 contract |
| CCTP | Natively integrated | Available but via third party |
| Target audience | Institutional finance, payments, FX, capital markets | General-purpose DeFi/dApps |
| Validator set | Permissioned (compliance-focused) | Permissioned sequencer / decentralized validators |

### Summary of Unique Selling Points

1. **USDC as gas eliminates ETH price risk** for enterprise treasury/accounting
2. **Sub-second deterministic finality** (no optimistic rollup challenge periods) — enables real-time settlement suitable for FX, payments, capital markets
3. **Built-in stablecoin FX engine (StableFX)** — on-chain currency trading with institutional RFQ system
4. **Opt-in privacy** — selectively shielded balances and transactions for compliance-sensitive use cases
5. **Full Circle platform integration** — USDC, EURC, CCTP, Circle Gateway, on/offramps all native
6. **Institutional backing** — BlackRock, Goldman Sachs, Visa, Mastercard, Deutsche Bank, HSBC building on testnet
7. **Anthropic/Claude integration** — Claude Code-powered developer tools embedded in the ecosystem

---

## 13. Gas Sponsorship / Paymaster Infrastructure

Arc supports **ERC-4337 Account Abstraction** with multiple paymaster providers confirmed on testnet:

| Provider   | Notes |
|------------|-------|
| **Pimlico** | AA infrastructure provider, confirmed Arc testnet support |
| **ZeroDev** | AA infrastructure, confirmed Arc testnet support |
| **Circle Paymaster** | Circle's own paymaster allows users to pay gas from USDC balance (ERC-4337 compatible) |
| **Alchemy** | Bundler + paymaster infrastructure with Arc support |

Since USDC is already the native gas token, the traditional "paymaster" use case (letting users pay gas in ERC-20 instead of ETH) is less necessary — users already pay in USDC natively. However, paymasters on Arc can be used for:
- Sponsoring gas for users entirely (gasless UX where dApp pays)
- Allowing payment in EURC or other stablecoins that aren't native gas

Circle's own Paymaster product (https://www.circle.com/paymaster) integrates with Pimlico and Alchemy bundlers and works on Arc.

---

## Sources

- [The Block: Circle to launch Layer 1 blockchain Arc](https://www.theblock.co/post/366540/circle-stablecoin-focused-evm-compatible-layer-1-blockchain-arc)
- [Circle Press Release: Arc Public Testnet Launch](https://www.circle.com/pressroom/circle-launches-arc-public-testnet)
- [Circle Blog: Introducing Arc](https://www.circle.com/blog/introducing-arc-an-open-layer-1-blockchain-purpose-built-for-stablecoin-finance)
- [Arc.network Blog: Public Testnet Live](https://www.arc.network/blog/circle-launches-arc-public-testnet)
- [Arc.network Blog: How Gas Works on Arc](https://www.arc.network/blog/how-gas-works-on-arc)
- [Arc Docs: Contract Addresses](https://docs.arc.network/arc/references/contract-addresses)
- [Arc Docs: Welcome to Arc](https://docs.arc.network/arc/concepts/welcome-to-arc)
- [ChainList: Arc Testnet (Chain 5042002)](https://chainlist.org/chain/5042002)
- [thirdweb: Arc Testnet](https://thirdweb.com/arc-testnet)
- [Alchemy: Arc Testnet RPC](https://www.alchemy.com/rpc/arc-testnet)
- [dRPC: Arc Testnet RPC](https://drpc.org/chainlist/arc-testnet-rpc)
- [KuCoin: Arc Token & Mainnet 2026](https://www.kucoin.com/news/articles/circle-ceo-confirms-arc-token-exploration-mainnet-launch-set-for-2026)
- [The Block: Arc Testnet with BlackRock, Visa, Anthropic](https://www.theblock.co/post/376497/circle-launches-arc-public-testnet-blackrock-visa-anthropic-among-institutional-participants)
- [CoinDesk: Circle Unveils StableFX on Arc](https://www.coindesk.com/business/2025/11/13/circle-unveils-stablefx-to-power-onchain-currency-trading-on-upcoming-arc-blockchain)
- [Blockchain.news: Circle 2026 Vision](https://blockchain.news/news/circle-2026-product-vision-arc-blockchain-usdc-expansion)
- [Blockscout Blog: The ARC of Innovation](https://www.blog.blockscout.com/the-arc-of-innovation/)
- [Circle Paymaster](https://www.circle.com/paymaster)
- [Finextra: Why Circle Built Arc](https://www.finextra.com/blogposting/30327/deep-dive-why-circle-built-arc-and-how-it-changes-payments)
