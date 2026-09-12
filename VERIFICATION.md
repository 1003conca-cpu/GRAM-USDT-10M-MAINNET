# Verification evidence

## Canonical token

- Network: `TON Mainnet`
- Supply profile: `10M`
- Jetton master: `EQDnJJ4GUHj84M1wJeMy5lQG5pmN4hZDI6OJy-7fKgg4VZSQ`
- Name: `GRAM`
- Symbol: `GRAM`

This exact master address is the only 10M token addressed by this verification file.

GRAM is an independent project utility token for internal project use, transfers, community rewards, testing and Web3 applications. It is not fiat money, not legal tender, not a stablecoin, and is not issued by, affiliated with, or backed by Tether/USDT.

A cached/off-chain value `GRAM(USDT)` is obsolete and conflicts with the current on-chain identity.

## Deployed hashes

Jetton minter code hash:
`6bf8f48ca97d3fd9c8e553344efe7af030c322459e2ee2197a052162f1961bfb`

Embedded Jetton wallet code hash:
`7bfa53bce90ce26cd368ec2989eba2bd15d286104742f0e04659f485a03012ba`

Base64:
`e/pTvOkM4mzTaOwpieuivRXShhBHQvDgRln0haAwEro=`

## Official TON Acton/Tolk Jetton v2.1 comparison

Reference repository: `ton-blockchain/acton-contracts`
Reference path: `jetton-v2.1/`
Reference revision used for source comparison: `7af1cea3cd0b990ae7b53a67b858c8cbd9da1e16`

The project source uses the same Jetton v2.1 contract model and official message opcodes, including:

- transfer: `0x0f8a7ea5`
- internal transfer: `0x178d4519`
- burn: `0x595f07bc`
- burn notification: `0x7bdd97de`
- mint: `0x642b7d07`
- metadata update: `0xcb862902`

A fresh build comparison of the official Acton Jetton v2.1 `JettonWallet` artifact produced the same wallet bytecode hash as the deployed embedded wallet:

`7bfa53bce90ce26cd368ec2989eba2bd15d286104742f0e04659f485a03012ba`

Therefore the deployed JettonWallet should not be classified as `modifiedContract` merely because its wallet bytecode is unrecognized by a stale allowlist. The prior comparison against the legacy FunC Jetton implementation was not the correct reference for this Tolk/Acton v2.1 package and has been removed from this document.

The minter source in this repository follows the official Acton/Tolk Jetton v2.1 minter flow. The presence of admin-only metadata/admin/code-management operations is part of that reference design and, by itself, is not evidence of malicious behavior.

## Requested platform review

1. Use the exact canonical master `EQDnJJ4GUHj84M1wJeMy5lQG5pmN4hZDI6OJy-7fKgg4VZSQ`.
2. Refresh cached metadata to `GRAM / GRAM` and remove obsolete `GRAM(USDT)` labeling.
3. Re-evaluate `SCAM`, blacklist, modified/custom-contract and trust-score classifications against the official Acton/Tolk Jetton v2.1 reference and the hashes above.
4. If a warning remains, identify the exact technical rule or upstream risk source responsible for it.
5. Do not require removal of admin/mint capability unless the reviewing platform has an explicit policy requiring it for this project token.
