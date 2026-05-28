# Dugout

On-chain fantasy football manager for the 2026 World Cup. Built on X Layer.

You draft five real World Cup players as NFTs. You stake OKB. You play matchday wars against other managers. The Oracle posts results from real matches. The winner takes 95% of the pot. Your cards forge from Bronze to Icon as they accumulate tournament points — permanently, on-chain.

That's the loop.

---

## Deployed contracts — X Layer Testnet (chainId 1952)

| Contract | Address | What it does |
|---|---|---|
| **Oracle** | [`0x45E4F619…40F60458`](https://www.oklink.com/xlayer-test/address/0x45E4F61912208Ac3cd1997D17742e3fb40F60458) | Posts matchday stats, calculates points per position |
| **DugoutNFT** | [`0x1E220dc0…46e570c8`](https://www.oklink.com/xlayer-test/address/0x1E220dc0d66869A12b30225300Ca286a46e570c8) | Mints a 5-player squad as 5 ERC-721 tokens. Stats update on-chain after each matchday. |
| **SquadWars** | [`0xf58DCaa5…090C564EF`](https://www.oklink.com/xlayer-test/address/0xf58DCaa53fe17f06602DaC3352aa16b090C564EF) | createWar / acceptWar / lockDecision / resolveWar. Real OKB stakes. 95/5 split on payout. |
| **PlayerMint** | [`0x6b1ea414…52aFdA38`](https://www.oklink.com/xlayer-test/address/0x6b1ea414a2BB471D6EFE2872396b53EC52aFdA38) | Marketplace ERC-721 — every player has a price + supply cap. 68 players seeded (60 current stars + 8 World Cup legends). |

Smoke-tested end-to-end: mint → war → accept → Oracle post → resolve → payout → reputation update. All six txs verifiable on the explorer. **~2.14M gas total. Cost: 0.0006 OKB.** Sub-cent.

---

## How the game works

**Draft (`/squad`).** Pick five players from the 60-player current roster. Must include exactly one goalkeeper. Free to mint (you only pay gas). The squad is bound to your address — no re-rolls.

**Battle (`/wars`).** Create a war: pick a matchday, set a stake. Anyone with a squad can accept. Once accepted, both sides lock their captain (2× points) and bench (0 points). The other 3 players score 1×.

**Resolve.** The Oracle posts matchday results — goals, assists, clean sheets, who played. Anyone can call `resolveWar`. The contract aggregates each squad's score using per-position scoring (GK clean sheet = 12 pts, FWD goal = 10, etc.), applies the stage multiplier (Group 1.0× through Final 3.0×), and pays out 95% of the pot to the winner.

**Forge (`/profile`).** Tournament points stack onto each player NFT. At 30 / 80 / 150 pts they auto-upgrade to Silver / Gold / Icon. Permanent. On-chain.

**Market (`/marketplace`).** Mint individual player NFTs at deterministic prices. Pelé sits at ~0.45 OKB; a mid-rated current player is ~0.005 OKB. Legends are capped at 100 mints each.

---

## Tech

- **Solidity 0.8.24** · OpenZeppelin v4.9.6 (v5's `mcopy` opcode is incompatible with X Layer's zkEVM) · Hardhat
- **Next.js 14** App Router · React 18 · TypeScript · Tailwind
- **wagmi v2** + **viem v2** + **TanStack Query** for chain reads/writes (multicall via `useReadContracts`)
- **Bebas Neue** for display, **Plus Jakarta Sans** for body, **JetBrains Mono** for stats
- All sound effects synthesized via the **Web Audio API** — no audio assets, works offline
- All 8 World Cup legend portraits **AI-generated via Pollinations.ai** (Flux model), backgrounds stripped locally with **@imgly/background-removal-node** (U2Net, ONNX, no API key)
- Music tracks (3, ambient): public Mixkit CDN — drop your own MP3s into `public/music/` to override

---

## Run it

```bash
git clone <this-repo>
cd dugout && npm install
cp packages/app/.env.local.example packages/app/.env.local  # or copy from below
cd packages/app && npm run dev
```

Open http://localhost:3000.

To connect, add **X Layer Testnet** to your wallet:
- RPC: `https://testrpc.xlayer.tech`
- Chain ID: `1952`
- Symbol: `OKB`
- Explorer: `https://www.oklink.com/xlayer-test`

Faucet: https://www.okx.com/xlayer/faucet

The four contract addresses in `packages/app/.env.local`:

```
NEXT_PUBLIC_CHAIN_ID=1952
NEXT_PUBLIC_ORACLE_ADDRESS=0x45E4F61912208Ac3cd1997D17742e3fb40F60458
NEXT_PUBLIC_NFT_ADDRESS=0x1E220dc0d66869A12b30225300Ca286a46e570c8
NEXT_PUBLIC_SQUAD_WARS_ADDRESS=0xf58DCaa53fe17f06602DaC3352aa16b090C564EF
NEXT_PUBLIC_PLAYER_MINT_ADDRESS=0x6b1ea414a2BB471D6EFE2872396b53EC52aFdA38
```

### Run the smoke test against the live contracts

```bash
cd packages/contracts
# Drop your deployer key into .env as PRIVATE_KEY=0x…  (any wallet with ~0.1 testnet OKB)
npx hardhat run scripts/smoke-test.ts --network xlayerTestnet
```

This generates a fresh wallet B, funds it from your deployer, then runs the full loop: both wallets mint squads → wallet A creates a war → wallet B accepts → Oracle posts results → war resolves → reputation updates → on-chain payout.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                     │
│  /  → portal landing (no nav, dramatic entry)               │
│  /play → manager hub (8 themed action tiles)                │
│  /squad → mint 5-card squad                                 │
│  /wars → create + browse + accept · all live on-chain       │
│  /war/[id] → individual war breakdown (live scores, sides)  │
│  /squad-setup/[id] → captain + bench picker (sessionStorage)│
│  /match/[id] → decision-engine preview (Dughole v2 spec)    │
│  /marketplace → mint any player at on-chain price           │
│  /profile → your squad + stats + history · all on-chain     │
│  /leaderboard → top managers · live · from getLeaderboard() │
│  /predict → prediction markets (locked until June 11)       │
│  /feed → live event timeline                                │
│  /rules → scoring + stages + FAQ                            │
└─────────────────────────────────────────────────────────────┘
                              │
                wagmi + viem  │  multicall via useReadContracts
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  X Layer Testnet (chainId 1952)              │
│                                                              │
│   Oracle  ──posts──▶  matchday results                       │
│      │                                                       │
│      ▼                                                       │
│   DugoutNFT ◀──reads── SquadWars ──pays──▶ winner            │
│      │                     │                                 │
│      │ mints               │ stakes OKB                      │
│      ▼                     ▼                                 │
│   ERC-721 player cards     OKB pot (95% to winner, 5% fee)   │
│                                                              │
│   PlayerMint (separate ERC-721, marketplace contract)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Two NFT systems, by design

Worth knowing up front: there are **two distinct ERC-721 contracts** for two different jobs.

- **`DugoutNFT`** — your **tournament squad**. One `mintSquad()` call per address mints 5 bound NFTs that participate in Squad Wars. Stats update on-chain after each matchday. `/profile` shows these.
- **`PlayerMint`** — a **trading marketplace**. Buy individual player NFTs at deterministic prices, including the 8 legends. These are part of your collection but **not** automatically in your tournament squad. A future v2 lets you swap marketplace mints into your squad between seasons.

Mint Pelé from the marketplace and he won't show up in `/profile` — he's in your wallet, but not your active squad. This is intentional separation, not a bug.

## What's real vs. presentational

Honest about it — this is a hackathon.

**Real and on-chain:**
- All 4 contracts deployed, verified bytecode
- Mint a squad, create/accept wars, lock captain/bench, post Oracle results, resolve, withdraw
- Reputation (wins, losses)
- 68 players seeded in the marketplace catalog with prices + supply caps
- Individual player NFT mints work end-to-end (real OKB → real ERC-721)
- `/wars`, `/profile`, `/leaderboard`, `/war/[id]`, `/marketplace`, `/squad` all read live chain state

**Presentational (v1 scope):**
- The `/match` decision engine — 8 decision moments with timers, mini-pitch, goal celebrations — is a **Dughole-spec preview**, not on-chain. The actual war resolution uses the Oracle's matchday stats, not your in-match choices.
- `/feed` events and the landing's broadcast ticker — illustrative
- `/predict` — locked, opens at World Cup kickoff
- Manager handles — displayed as truncated wallet addresses (no ENS-style names yet)

---

## What's next (Season 2 / Dughole)

Full v2 spec lives in [`docs/dughole.md`](docs/dughole.md). Highlights:

- **Real-time pause-and-decide match engine** — instead of passive aggregate scoring, every key moment involving one of your players pauses the simulation. You choose a tactical option in a 10-second window. Decisions cascade (one bad tackle → conceded goal → composure drop → your next decisions get harder).
- **17 attributes per player** (Technical / Mental / Physical) — already derived for the preview, but currently off-chain. v2 stores them.
- **Skill cards** (ERC-1155) — equippable, modify decision options
- **Synergy discovery** — combinations of players that unlock hidden buffs
- **Training staking** — stake tokens between matches to accelerate attribute growth
- **Player aging + retirement** — NFTs decay after age 31, retire at 38, convert to Legacy Cards
- **League promotion/relegation** with stake tiers
- **On-chain decision log** — every match choice gets logged, building a verifiable manager profile

---

## License

MIT.

Built for the OKX X Layer hackathon, May 2026.
