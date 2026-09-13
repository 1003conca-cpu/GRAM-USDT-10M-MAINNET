# GRAM 10M Mainnet — Rename Map

Historical identifiers are retained only in this archive record for auditability. This file is `NOT ACTIVE / NOT FOR DEPLOYMENT`.

| Tên cũ | Tên mới | Lý do | Tham chiếu đã cập nhật |
|---|---|---|---|
| `GRAM-USDT-10M-MAINNET` display/title | `GRAM 10M Mainnet` | Remove stale pair-style identity | `README.md`, docs, PR title/body |
| `gram-usdt-10m` package | `gram-10m-mainnet` | Canonical slug | `Acton.toml`, `package.json` |
| `GRAM(USDT)` description/label | `GRAM` / `GRAM 10M Mainnet` | Match authoritative token identity | active manifests/docs |
| `contracts/` development tree | `experimental/not-deployed/acton-v2.1/contracts/` | Preserve non-deployed source outside verification build | `README.md`, `Acton.toml` |
| `gen/JettonWallet.code.tolk` development artifact | `experimental/not-deployed/acton-v2.1/gen/JettonWallet.code.tolk` | Keep historical artifact out of deployed-source path | source separation docs |
| verifier snapshot sources | `verified-source/gram-10m-mainnet/contracts/` | Dedicated immutable deployed-source area | build/test/CI paths |
| `APPEAL.md` | `docs/archive/legacy-APPEAL.md` | Historical submission material only | removed from active root |
| `ChatGPT Image 08_01_01 9 thg 9, 2026.png` | `gram-10m-mainnet-logo.png` | Canonical, stable asset filename | active documentation/assets |

Forbidden active identifiers include references to `5M`, `6M`, `USDT-GRAM`, `GRAM-USDT`, and `GRAM(USDT)`. CI allows those strings only in this archive/migration record and other explicitly archived material.
