# GRAM-USDT-10M-MAINNET

TON Mainnet Jetton source package for the deployed 10M GRAM contract.

## Canonical identity

- Network: `TON Mainnet`
- Supply profile: `10M`
- Jetton Master: `EQDnJJ4GUHj84M1wJeMy5lQG5pmN4hZDI6OJy-7fKgg4VZSQ`
- Name: `GRAM`
- Symbol: `GRAM`

This address is the canonical 10M token identifier for this repository. Do not substitute another historical/project address when reviewing this source package.

GRAM is an independent project utility token intended for internal project use, transfers, community rewards, testing and Web3 applications. It is not fiat money, not legal tender, not a stablecoin, and is not issued by, affiliated with, or backed by Tether/USDT.

Any cached/off-chain label such as `GRAM(USDT)` is obsolete and does not represent the current on-chain identity.

## Source basis

The contract sources in `contracts/` follow TON's official Acton/Tolk Jetton v2.1 reference implementation:

- Repository: `ton-blockchain/acton-contracts`
- Reference path: `jetton-v2.1/`
- Contract metadata: `The Tolk Team`, version `2.1`
- Standards: TEP-74 and TEP-89

The Jetton message opcodes, minter flow, wallet flow, sharding helpers and storage layout in this package are based on that reference implementation. This package must not be described as a custom replacement of the Jetton protocol solely because it is Tolk/Acton rather than legacy FunC.

## Build

The compiler/build configuration is in `Acton.toml`. The Jetton Wallet code is embedded through `gen/JettonWallet.code.tolk`.

## Verification

See `VERIFICATION.md` for deployed hashes and bytecode comparison evidence. In particular, the deployed embedded Jetton Wallet hash matches the official TON Acton Jetton v2.1 wallet artifact used for comparison.
