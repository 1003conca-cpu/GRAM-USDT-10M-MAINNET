# GRAM-USDT-10M-MAINNET

TON Mainnet Jetton source package for the deployed GRAM contract.

## Deployed Jetton Master

`EQDnJJ4GUHj84M1wJeMy5lQG5pmN4hZDI6OJy-7fKgg4VZSQ`

## Source basis

This package is a Tolk/Acton port of the official TON Jetton v2 design and targets TEP-74 and TEP-89 behavior.

Official reference implementation:
- `ton-blockchain/jetton-contract`, branch `jetton-2.0`
- `contracts/jetton-minter.fc`
- `contracts/jetton-wallet.fc`

## Build

The compiler/build configuration is in `Acton.toml`. The Jetton Wallet code is embedded through `gen/JettonWallet.code.tolk`.

## Verification note

The deployed code is compiled from Tolk, so its bytecode/hash is not expected to equal the FunC reference byte-for-byte even where the behavior is intended to be equivalent. See `VERIFICATION.md` for the exact hashes and the current DYOR-relevant difference.
