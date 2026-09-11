# Verification evidence

Jetton master:
`EQDnJJ4GUHj84M1wJeMy5lQG5pmN4hZDI6OJy-7fKgg4VZSQ`

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

## Remediation path

1. Keep this exact source and build configuration public and reproducible.
2. Submit the source/hash evidence for manual verification by indexers.
3. If byte-for-byte recognition is required, prepare a separate migration plan based on the official compiled Jetton v2 wallet/minter and verify storage compatibility before any on-chain upgrade.
4. No on-chain upgrade should be signed until existing holder wallet-address migration is proven safe.
