# GRAM 10M Mainnet Verification

## Canonical target

- Jetton Master: `EQDnJJ4GUHj84M1wJeMy5lQG5pmN4hZDI6OJy-7fKgg4VZSQ`
- Network: TON Mainnet
- Name/Symbol: `GRAM / GRAM`
- Decimals: `9`
- Observed supply: `10,000,010 GRAM`
- Mintable: `true`
- Admin raw: `0:fdb4789ea877c681cf6f85ac6bd67ab61495c92161d6320e23780b1e1af16633`

## Deployed code target

- Expected code hash hex: `6bf8f48ca97d3fd9c8e553344efe7af030c322459e2ee2197a052162f1961bfb`
- Expected code hash Base64: `a/j0jKl9P9nI5VM0Tv568DDDIkWeLuIZegUhYvGWG/s=`
- Compiler: Tolk `1.4.0`
- Source snapshot commit: `c03cd28500dfda162b430f37da01916e0803a5fe`

The eight immutable source files are stored at `verified-source/gram-10m-mainnet/contracts/`. Their SHA-256 values are locked in `verified-source/gram-10m-mainnet/SHA256SUMS`.

## Verification procedure

From a fresh checkout:

```bash
npm install --ignore-scripts --no-package-lock
npm test
```

`npm test` performs a clean build with `@ton/tolk-js=1.4.0`, runs the repository tests, verifies all eight source checksums, verifies active naming/link rules, and compares the resulting code hash against the deployed target hash. Any mismatch exits non-zero.

## Source-verifier evidence boundary

The immutable verifier snapshot is authoritative evidence for the source payload, compiler version and code hash. Its recorded `knownContractAddress` is not the GRAM 10M master address, so that field is not represented here as direct address-level proof for this Jetton Master. The repository instead requires an independent clean-build hash match.

## Supply truth

`10,000,000 GRAM` was the previously described initial amount. The verified current observed supply is `10,000,010 GRAM`; the contract remains `mintable: true`. This repository therefore makes no fixed-supply, hard-cap, immutable-supply or renounced-admin claim.
