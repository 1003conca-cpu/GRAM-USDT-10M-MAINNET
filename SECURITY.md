# Security — GRAM 10M Mainnet

This repository is a verification and handover package. It does not authorize or perform on-chain state changes.

## Prohibited operations in this remediation

No minting, burning, contract upgrade, administrator change, metadata mutation, deployment, signing, seed phrase use, force-push, history rewrite, or pull-request merge is performed by this branch.

## Administrative state

The verified source exposes mintability as `storage.adminAddress != null`. Current project evidence records `mintable: true` and an existing administrator. Consumers must not infer renounced administration or immutable supply.

## External risk labels

Explorer, wallet, indexer, and third-party risk labels are external platform state. Repository changes do not themselves remove or alter those labels. Any claim that an external warning has been cleared requires direct evidence from that platform.

## Verification boundary

Only a clean build from the immutable verifier source snapshot using Tolk `1.4.0`, followed by an exact deployed-code-hash comparison, is accepted as reproducible-build evidence.
