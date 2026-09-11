# Standardized GRAM Jetton source candidate

This directory contains the reviewed Tolk/Acton source candidate prepared for GRAM on TON Mainnet.

## Main changes

- Removed the custom minter upgrade message and `setCodePostponed` path.
- Removed two-step `nextAdminAddress` / claim-admin flow.
- Removed separate drop-admin message; admin revocation uses `ChangeMinterAdmin` with a null address.
- Uses the common minter operation ids:
  - Mint: `0x00000015`
  - Change admin: `0x00000003`
  - Change metadata: `0x00000004`
- Jetton transfer, burn, wallet discovery and wallet state logic remain covered by the existing test suite.

## Local verification

The candidate was built and tested independently in two local workspaces:

- `/root/gram-ton-10m-standard`
- `/root/gram-ton-6m-standard`

Both runs completed with **74 passed tests in 8 files**.

The two builds produced identical JSON artifact SHA-256 values:

- `JettonMinter.json`: `e60f772a8b547edebb9baac313d90e921b9b7aba4b58a57aeb2331949f457ea0`
- `JettonWallet.json`: `3876b3de3d2acfeae8c46694fdfdad81bdf87cef516fede1066fbf1f5cc00397`

Compiled TVM root code hashes:

- Minter: `85b116ed74829d1cd55304e1c2d974e7c826440304e3c3efb1cc838c2815edf0`
- Wallet: `7bfa53bce90ce26cd368ec2989eba2bd15d286104742f0e04659f485a03012ba`

Base64 hashes:

- Minter: `hbEW7XSCnRzVUwThwtl058gmRAME48PvscyDjCgV7fA=`
- Wallet: `e/pTvOkM4mzTaOwpieuivRXShhBHQvDgRln0haAwEro=`

## Important deployment note

This directory is a **review candidate only**. It has not been deployed to either GRAM Mainnet contract. No on-chain upgrade or wallet signature was performed while preparing this branch.

The wallet code hash remains the Tolk/Acton wallet hash shown above. It is therefore not claimed to be byte-for-byte identical to the official FunC Jetton v2 wallet artifact. A manual indexer/verifier review should use the source, build evidence and hashes rather than assuming bytecode identity.
