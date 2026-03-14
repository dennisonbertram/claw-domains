# MegaETH Research

**Date:** 2026-03-13
**ETH Price Reference:** ~$2,133 USD (March 13, 2026)

---

## 1. Current Network Status

MegaETH is **live on mainnet** as of **February 9, 2026**. The mainnet launch followed:
- A Frontier beta phase (developer-only, launched ~December 2025)
- A stress test in late January 2026 that processed 10.7 billion transactions in one week at a sustained 35,000 TPS

**Mainnet name:** MEGA Mainnet (sometimes referred to as "Frontier")
**Testnet name:** MegaETH Testnet (also called "Carrot" testnet based on RPC hostname)

MegaETH is an Ethereum L2 ("real-time blockchain") with sub-10 ms block times, 100,000+ TPS theoretical capacity, and EigenDA-based data availability. It settles to Ethereum mainnet.

---

## 2. Chain IDs

| Network | Chain ID | Hex |
|---------|----------|-----|
| MegaETH Mainnet | **4326** | 0x10e6 |
| MegaETH Testnet | **6343** | 0x18c7 |

Note: ChainList.org lists testnet chain ID as 6342 in some entries, but official docs and datawallet.com reference 6343. Use 6343 from the official docs.

---

## 3. RPC URLs

### Mainnet
- Official: `https://mainnet.megaeth.com/rpc`
- Alchemy (API key required): `https://megaeth-mainnet.g.alchemy.com/v2/<api-key>`
- dRPC (no tracking): `https://megaeth.drpc.org`
- GlobalStake: `https://rpc-megaeth-mainnet.globalstake.io`
- WebSocket: `wss://megaeth.drpc.org`

### Testnet
- Official: `https://carrot.megaeth.com/rpc`
- WebSocket: `wss://carrot.megaeth.com/ws`

---

## 4. Gas Costs

### Gas Token
The native gas token is **ETH** (Ether, 18 decimals) on both mainnet and testnet.

### Gas Price
The base fee is set at **0.001 gwei** (10^6 wei = 1,000,000 wei).
Per official docs: "Base fee adjustment is effectively disabled" — the fee does not dynamically adjust under load the way Ethereum's EIP-1559 does.

### Deployment Cost Calculation

Assumptions:
- Gas price: 0.001 gwei = 0.000000001 ETH per gas unit
- ERC721 + Ownable contract: ~1,500,000 to 2,500,000 gas
- ETH price: $2,133 USD (March 13, 2026)

| Gas Used | Cost in ETH | Cost in USD |
|----------|------------|-------------|
| 1,500,000 gas | 0.0000015 ETH | ~$0.0032 |
| 2,000,000 gas | 0.0000020 ETH | ~$0.0043 |
| 2,500,000 gas | 0.0000025 ETH | ~$0.0053 |

**Summary: Deploying a typical ERC721+Ownable contract on MegaETH costs approximately $0.003–$0.005 USD.** This is effectively negligible compared to Ethereum (~$5–$50+) or even Base (~$0.05–$0.50).

**Formula:** `gas_used * 0.001e-9 ETH * $2,133 = cost_USD`

The 24h total transaction fees on mainnet at time of writing were 0.78 ETH (~$1,664), indicating very low per-transaction costs across the whole network.

---

## 5. USDC Availability

**Circle's official USDC is NOT available on MegaETH** (not listed on Circle's official USDC contract address page as of March 2026).

MegaETH's native stablecoin is **USDm (MegaUSD)**, issued via Ethena's stablecoin stack:

| Network | Contract Address |
|---------|-----------------|
| MegaETH Mainnet | `0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7` |
| Ethereum Mainnet (L1 token) | `0xEc2AF1C8B110a61fD9C3Fa6a554a031Ca9943926` |

USDm is backed by USDC deposits bridged from Ethereum via LayerZero (OFT standard). The bridge uses a vault contract on Ethereum at `0x0CA3A2FBC3D770b578223FBB6b062fa875a2eE75`.

WETH9 on MegaETH Mainnet: `0x4200000000000000000000000000000000000006`

For applications requiring Circle USDC specifically, it would need to be bridged manually or users would use USDm as the USD-pegged equivalent. Given MegaETH's recent launch (Feb 9, 2026), Circle may add official support in the future.

---

## 6. Block Explorers

| Network | Explorer |
|---------|---------|
| Mainnet (Etherscan-style) | https://mega.etherscan.io |
| Mainnet (Blockscout) | https://megaeth.blockscout.com |
| Mainnet (MegaExplorer) | https://www.megaexplorer.xyz/ |
| Testnet (Blockscout) | https://megaeth-testnet-v2.blockscout.com |
| Testnet uptime monitor | https://uptime.megaeth.com |

---

## 7. Testnet Faucet

**Faucet URL:** https://faucet.timothy.megaeth.com/claim
(Also accessible via thirdweb: https://thirdweb.com/megaeth-testnet)

**Process:**
1. Enter your wallet address
2. Complete Cloudflare Turnstile CAPTCHA
3. Click "Get Testnet Tokens"

**Amount:** 0.01 ETH per claim
**Frequency:** Once every 24 hours
**Cost:** Free
**Value:** Testnet tokens have no real monetary value

---

## 8. Wallet Support

MegaETH is **not pre-configured** in MetaMask, Coinbase Wallet, or Rainbow out of the box. Users must **add the network manually**.

### Supported wallets (manual add required):
- MetaMask
- Coinbase Wallet
- Rainbow Wallet
- Trust Wallet
- Any EVM-compatible wallet (WalletConnect-compatible)

### Fastest method: Chainlist
Visit https://chainlist.org/?search=megaeth and click "Add to Wallet" — automatically fills in RPC, Chain ID, and explorer. Takes under 30 seconds.

### Manual MetaMask configuration:

**Mainnet:**
| Field | Value |
|-------|-------|
| Network Name | MegaETH Mainnet |
| RPC URL | https://mainnet.megaeth.com/rpc |
| Chain ID | 4326 |
| Currency Symbol | ETH |
| Block Explorer | https://mega.etherscan.io |

**Testnet:**
| Field | Value |
|-------|-------|
| Network Name | MegaETH Testnet |
| RPC URL | https://carrot.megaeth.com/rpc |
| Chain ID | 6343 |
| Currency Symbol | ETH |
| Block Explorer | https://megaeth-testnet-v2.blockscout.com |

---

## 9. Gas Sponsorship / Paymaster (ERC-4337)

### ERC-4337 (Account Abstraction)
The official MegaETH docs do not explicitly mention native ERC-4337 EntryPoint deployment or built-in paymaster infrastructure. However:

- **Alchemy** lists a **Bundler API** and **Gas Manager API** as supported products for MegaETH, which implies ERC-4337 bundler/paymaster infrastructure is available via Alchemy's platform (https://www.alchemy.com/rpc/megaeth).
- **Infinex** partnership: At mainnet launch, new users can interact with MegaETH through their first transaction with **no gas fees** via Infinex's superapp integration.
- Given that gas is already ~$0.003–$0.005 per typical transaction, sponsorship is less critical than on higher-fee chains.

### Summary
- No documented **native** ERC-4337 EntryPoint in the MegaETH protocol itself (not confirmed in docs)
- **Alchemy's Gas Manager API** provides paymaster functionality for developers building on MegaETH
- Gas costs are so low (fractions of a cent) that sponsorship is less of a user-experience necessity than on other chains

---

## Key Numbers Summary

| Item | Value |
|------|-------|
| Mainnet chain ID | 4326 |
| Testnet chain ID | 6343 |
| Main RPC (mainnet) | https://mainnet.megaeth.com/rpc |
| Main RPC (testnet) | https://carrot.megaeth.com/rpc |
| Gas token | ETH |
| Base fee | 0.001 gwei |
| ERC721+Ownable deploy (2M gas) | ~$0.004 USD |
| Native stablecoin | USDm at `0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7` |
| Circle USDC | Not officially deployed on MegaETH |
| Block explorer | https://mega.etherscan.io / https://megaeth.blockscout.com |
| Testnet faucet | https://faucet.timothy.megaeth.com/claim |
| Wallet support | Manual add required; Chainlist simplifies it |
| ERC-4337 | Not natively documented; available via Alchemy infrastructure |

---

## Sources

- [MegaETH Docs – Mainnet (Frontier)](https://docs.megaeth.com/frontier)
- [MegaETH Docs – Testnet](https://docs.megaeth.com/testnet)
- [ChainList – MegaETH Testnet (6342)](https://chainlist.org/chain/6342)
- [ChainList – MegaETH Mainnet (4326)](https://chainlist.org/chain/4326)
- [MegaETH mainnet goes live Feb. 9 – CoinDesk](https://www.coindesk.com/tech/2026/01/28/megaeth-mainnet-to-go-live-feb-9-in-major-test-of-real-time-ethereum-scaling)
- [MegaETH Mainnet Live – bitcoinethereumnews](https://bitcoinethereumnews.com/tech/megaeth-mainnet-live-mega-token-tied-to-usage/)
- [MegaETH RPC – Alchemy](https://www.alchemy.com/rpc/megaeth)
- [How to Add MegaETH to MetaMask – DataWallet](https://www.datawallet.com/crypto/add-megaeth-to-metamask)
- [USDm token on MegaETH Etherscan](https://mega.etherscan.io/token/0xfafddbb3fc7688494971a79cc65dca3ef82079e7)
- [MEGA Mainnet Blockscout Explorer](https://megaeth.blockscout.com/)
- [Circle USDC Contract Addresses](https://developers.circle.com/stablecoins/usdc-contract-addresses)
- [MegaETH Faucet guide – Metana](https://metana.io/blog/how-to-claim-free-eth-from-megaeth-faucet/)
- [MegaETH Frontier mainnet beta launch – crypto.news](https://crypto.news/megaeth-frontier-mainnet-beta-developers-launch-2025/)
- [ETH price March 13 2026 – Fortune](https://fortune.com/article/price-of-ethereum-03-13-2026/)
