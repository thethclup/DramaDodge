# Drama Dodger

Drama Dodger is a chaotic, funny, and high-speed endless dodger game built for the Base mainnet. You are a Drama Dodger trying to survive in the wild world of social media. Run through an endless feed while dodging toxic comments, FUD attacks, ratio mobs, and more.

## Core Gameplay
- **Endless Dodger:** Fast-paced side-scrolling endless dodger.
- **Controls:** Swipe up/down (or click top/bottom of canvas) and use Keyboard Space/Up/Down to jump and slide.
- **Drama:** Dodge Ratio Comments, FUD Clouds, Cancel Waves.
- **Collectibles:** GM Comments, Based Orbs to gain score and Hype Shield.
- **Hype Shield:** Collect enough positive energy to activate temporary immunity.

## Features
- Base Denim 200ms Native Blocks (replaces Flashblocks with canonical 200ms blocks; zero 'pending' tag dependency)
- Base Mainnet & Base Sepolia (Denim Live) Support via SIWE (Sign-In with Ethereum)
- Onchain action scoring capabilities with real-time 200ms block tracking
- ERC-8021 Transaction Attribution support (`ox/erc8021`)
- ERC-8004 Trustless Agents support (MCP)
- Smooth Canvas rendering and mobile-first, responsive design

## Base Denim Migration (200ms Native Blocks - LIVE on Mainnet)
This project is fully migrated for the **Base Denim** hardfork:
- **Mainnet & Sepolia Live**: Denim activated on Base Sepolia on October 21, 2026 at 18:00 UTC, and on **Base Mainnet on November 5, 2026 at 18:00 UTC**.
- **Flashblocks Retired**: Flashblocks production and WebSocket endpoints (`wss://mainnet.flashblocks.base.org/ws`) stopped at activation. Subscriptions use `newHeads` and canonical `logs`.
- **Elimination of Preconfirmation / `pending` Tag**: All RPC queries (`eth_getBlockByNumber`, `eth_getBalance`, `eth_call`, etc.) query latest canonical 200ms blocks.
- **Fast 200ms Polling**: Wagmi transport configured with 200ms block time and 200ms polling cadence.
- **Node Operators**: Requires `base/base v1.5.1+` for Base Mainnet and `v1.5.0+` for Base Sepolia.

## Architecture & Agents
- **A2A (Agent-to-Agent):** Orchestrator agent endpoint for inter-agent communication.
- **MCP (Model Context Protocol):** Secure tool execution and drama calculation hooks available at `/api/mcp`.
- **Serverless API:** Highly available Vercel backend using serverless API routes without NEXT.js bloatedness.


## Run Locally
1. Clone the repository.
2. `npm install`
3. `npm run dev`

Open localhost:3000 and connect your wallet on the Base network to try the SIWE integration.

## License
MIT
