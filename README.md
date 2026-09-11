# GRAM-USDT-10M-MAINNET

TON Mainnet Jetton source package for the deployed GRAM contract.

## Project identity

GRAM is an independent project utility token intended for internal project use, transfers, community rewards, testing and Web3 applications. It is not fiat money, not legal tender, not a stablecoin, and must not be represented as Tether USDT. It is not issued by, affiliated with, or backed by Tether.

Official token identity:
- Name: `GRAM`
- Symbol: `GRAM`
- Network: TON Mainnet
- Jetton Master: `EQDnJJ4GUHj84M1wJeMy5lQG5pmN4hZDI6OJy-7fKgg4VZSQ`

Any third-party cached/off-chain name such as `GRAM(USDT)` is outdated and does not represent the current on-chain token identity.

## Source basis

This package is a Tolk/Acton port of the official TON Jetton v2 design and targets TEP-74 and TEP-89 behavior.

Official reference implementation:
- `ton-blockchain/jetton-contract`, branch `jetton-2.0`
- `contracts/jetton-minter.fc`
- `contracts/jetton-wallet.fc`

## Build

The compiler/build configuration is in `Acton.toml`. The Jetton Wallet code is embedded through `gen/JettonWallet.code.tolk`.

## Verification note

The deployed code is compiled from Tolk, so its bytecode/hash is not expected to equal the FunC reference byte-for-byte even where the behavior is intended to be equivalent. See `VERIFICATION.md` for the exact hashes and current verification evidence.
