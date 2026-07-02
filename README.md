# OrbitRank

## Live Links

- App: https://orbitrank.vercel.app
- Repository: https://github.com/assmore22/orbitrank
A GenLayer-powered reputation orbit protocol for open-source maintainers and contributors.

This repo is centered on evidence operations: collecting sources, comparing claims, producing review outputs and keeping the audit trail public.

## OrbitRank Brief

The contract keeps JSON-backed records, exposes read models for the frontend, and uses GenLayer consensus for review-sensitive actions.

The important files are:

- `contracts/OrbitRank.py` - GenLayer contract source
- `deployment.json` - Studionet address, deploy transaction and smoke transaction hashes
- `package.json` - frontend runtime
- `README.md` - this operator and reviewer guide

## OrbitRank Chain Links

- Network: studionet (61999)
- Contract: [0x51F7F3076383D85dca90E243f2Ae78DF3f096366](https://explorer-studio.genlayer.com/contracts/0x51F7F3076383D85dca90E243f2Ae78DF3f096366)
- Deploy tx: [0xec18eef5...b0daf7](https://explorer-studio.genlayer.com/tx/0xec18eef51060f015447d8c1e7fce05af56cdc3d7b55a6d1836aab2827fb0daf7)
- Deployed at: 2026-06-22T16:13:35.927Z
- Smoke writes recorded: 10

## Evidence Mechanics

Typical flow: `submit_contribution` -> `resolve_challenge` -> `challenge_contribution` -> `file_appeal` -> `archive_project` -> `register_project` -> `activate_project`

Useful reads: `get_project`, `get_claim`, `get_challenge`, `get_appeal`, `get_profile`, `get_recent_projects`, `get_active_projects`, `get_ranked_projects`

- Primary source: `contracts/OrbitRank.py` (36,111 bytes)
- Public write/action methods: 10
- Read methods: 16
- GenLayer features: live web rendering, LLM adjudication, validator-comparative consensus, indexed storage, append-only collections

## Smoke Trail

- register_project: [0xd37df703...8adeab](https://explorer-studio.genlayer.com/tx/0xd37df703eccd7104a03275d80b61e0a269fc1eae49bbfc1304d0d75b078adeab)
- activate_project: [0xc5695551...ad37a7](https://explorer-studio.genlayer.com/tx/0xc56955518497b07922160f3d61847336effc915b8f21fb97b16990d29cad37a7)
- submit_contribution: [0xa976507f...e9f294](https://explorer-studio.genlayer.com/tx/0xa976507f5280b494e56b044cf7b2935f7b6775a3fa0dd6a86eff1bd7c0e9f294)
- assess_contribution: [0xcb39b0e7...8e5b20](https://explorer-studio.genlayer.com/tx/0xcb39b0e7320abc251a0de85e743257a76beeff51a156aba4c8a5e9429c8e5b20)
- challenge_contribution: [0x9b000214...214c9b](https://explorer-studio.genlayer.com/tx/0x9b0002142e2b87ad5b69515731de3968551c92bc4f75cfa37f14ee7f22214c9b)
- file_appeal: [0x7be43059...bc0e9c](https://explorer-studio.genlayer.com/tx/0x7be43059bb8104135fbb5282d4edeceeb384f222f310f24f5e7dd29a97bc0e9c)
- resolve_challenge: [0x954fbed2...f10c06](https://explorer-studio.genlayer.com/tx/0x954fbed26faeaf31f81a8e7f34bf8cbf8af48080c29ee21276dda8698df10c06)
- resolve_appeal: [0xf26f8607...3cebc7](https://explorer-studio.genlayer.com/tx/0xf26f8607f5d8744c21a2e89842811a2d680407f059e8b7accb9171d11f3cebc7)

## Run OrbitRank Locally

```powershell
cd <this-repository-folder>
npm install
npm run dev
```

Open the dev server URL printed by npm.

## Keys And Boundaries

- This repository should contain no decrypted wallet material.
- The Studionet deployer private key stays in the local encrypted vault.
- Vercel deployment should use the project folder only.

- QA notes: Browser QA 1440px + 390px: orbit workspace (Zdog renders tilted orbit rings + center project node + orbiting claim node colored by verdict/sized by quality + stars; circular orbit-ring nav; right inspector drawer; bottom D3 leaderboard ribbon...
