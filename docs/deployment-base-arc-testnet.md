# Deployment: Arc Testnet (with Permit Functions)

**Date**: 2026-03-15
**Chain**: Arc Testnet
**Chain ID**: 5042002
**RPC**: https://rpc.testnet.arc.network

## Contract Addresses

| Contract       | Address                                      |
|---------------|----------------------------------------------|
| ClawRegistry  | `0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3` |
| ClawResolver  | `0x3DD454c7b4FFe55469a5710A86fe86ab9f85c75e` |
| USDC          | `0x3600000000000000000000000000000000000000` |

## Deployer

- **Address**: `0x41778a296556143172bC20B197bba71683E41377`

## Transaction Hashes

| Contract       | Transaction Hash                                                         |
|---------------|--------------------------------------------------------------------------|
| ClawRegistry  | `0x6ee09745265d1fcd335703cc7d894012c0c31ee30d0cece4b2dba083e9da6712` |
| ClawResolver  | `0xf91935f8940a04b6aa61555aa9c7aad22a0c29d57b6ea04024fe1047b883e5cd` |

## New Features in This Deployment

This deployment includes two new permit-based functions that were not in the previous deployment:

- **`registerWithPermit(string name, address domainOwner, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`** -- Register a .claw domain with a USDC EIP-2612 permit signature, enabling single-transaction registration (no separate approve step).
- **`renewWithPermit(uint256 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`** -- Renew a .claw domain with a USDC EIP-2612 permit signature, enabling single-transaction renewal.

Both functions use a try/catch pattern on the permit call so they gracefully handle cases where approval already exists.

## Previous Deployment (Superseded)

| Contract       | Address (old)                                 |
|---------------|----------------------------------------------|
| ClawRegistry  | `0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C` |
| ClawResolver  | `0xDF4FaEc0390505f394172D87faa134872b2D54B4` |

These contracts are now superseded by the new deployment above. The shared package (`packages/shared/src/addresses.ts`) has been updated to point to the new addresses.
