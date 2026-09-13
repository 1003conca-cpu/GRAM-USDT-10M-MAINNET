# GRAM 10M Mainnet

Canonical repository identity: `gram-10m-mainnet`.

## Token identity

- Network: TON Mainnet
- Jetton Master: `EQDnJJ4GUHj84M1wJeMy5lQG5pmN4hZDI6OJy-7fKgg4VZSQ`
- Name: `GRAM`
- Symbol: `GRAM`
- Decimals: `9`
- Observed on-chain supply: `10,000,010 GRAM`
- Mintable: `true`

The observed supply is not described as a fixed supply or hard cap. Administrative capability remains present according to the verified deployed source and current getter state.

## Verified deployed source

The authoritative deployed-source snapshot is stored under:

`verified-source/gram-10m-mainnet/`

Provenance and per-file SHA-256 checksums are recorded in:

- [PROVENANCE.md](verified-source/gram-10m-mainnet/PROVENANCE.md)
- [SHA256SUMS](verified-source/gram-10m-mainnet/SHA256SUMS)

Compiler: Tolk `1.4.0`, pinned exactly by `package.json`.

Expected deployed code hash:

`6bf8f48ca97d3fd9c8e553344efe7af030c322459e2ee2197a052162f1961bfb`

## Reproducible verification

```bash
npm install --ignore-scripts --no-package-lock
npm test
```

The test/verification pipeline fails if the source checksums, compiler version, build code hash, active naming rules, or internal documentation links are invalid.

## Source separation

The historical development source is retained only in `experimental/not-deployed/acton-v2.1/`. It is not part of the deployed-source verification build.

## Handover

See [VERIFICATION.md](VERIFICATION.md), [SECURITY.md](SECURITY.md), and [HANDOVER.md](HANDOVER.md).
