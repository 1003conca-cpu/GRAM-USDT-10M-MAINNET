# Verification evidence

Jetton master:
`EQDnJJ4GUHj84M1wJeMy5lQG5pmN4hZDI6OJy-7fKgg4VZSQ`

## Project identity

GRAM is an independent project utility token for internal project use, transfers, community rewards, testing and Web3 applications. It is not fiat money, not legal tender, not a stablecoin, and is not issued by, affiliated with, or backed by Tether.

Current official identity:
- Name: `GRAM`
- Symbol: `GRAM`
- Network: TON Mainnet

A third-party cached/off-chain value `GRAM(USDT)` is outdated and conflicts with the current on-chain identity. Reviewers are requested to use the on-chain `GRAM / GRAM` identity and remove the stale `GRAM(USDT)` label.

## Deployed / local build hashes

Jetton minter code hash:
`6bf8f48ca97d3fd9c8e553344efe7af030c322459e2ee2197a052162f1961bfb`

Embedded Jetton wallet code hash used by the deployed GRAM contract:
`7bfa53bce90ce26cd368ec2989eba2bd15d286104742f0e04659f485a03012ba`

DYOR reports the same wallet code hash in base64:
`e/pTvOkM4mzTaOwpieuivRXShhBHQvDgRln0haAwEro=`

## Official TON Jetton v2 reference

Repository: `ton-blockchain/jetton-contract`
Branch: `jetton-2.0`

Official compiled Jetton Wallet hash:
`346250c205f56acfb6afa6fe7b76550805d256c6d8e47dd4f94ff672b47d19d3`

Base64:
`NGJQwgX1as+2r6b+e3ZVCAXSVsbY5H3U+U/2crR9GdM=`

## Important comparison result

The current GRAM Jetton Wallet bytecode hash is different from the official FunC Jetton v2 wallet bytecode hash. This is expected from the Tolk/Acton port at bytecode level, but it is also the strongest concrete difference relevant to an indexer that classifies contracts by known code hashes.

The minter upgrade operation is NOT by itself evidence of a non-standard modification: the official `jetton-2.0` minter also contains an admin-only upgrade operation using `set_data` and `set_code`.

Do not replace the embedded wallet code in a live Jetton without a migration analysis. Jetton wallet addresses are derived from wallet code, owner and minter; changing the wallet code can derive different wallet addresses for existing holders.

## Requested review

1. Correct stale third-party metadata from `GRAM(USDT)` to `GRAM`.
2. Review any `SCAM`, blacklist, modified/custom-contract or trust-score classification against this public source and the deployed hashes.
3. Treat GRAM as an independent project token, not as USDT or a representation of fiat money.
4. Identify any remaining concrete technical remediation required for verification.
5. Do not require removal of admin/mint capability unless a platform has an explicit policy that makes it necessary for this project token.
