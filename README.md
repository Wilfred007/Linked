💜 Link Up
Web3 Relationship Payments on Cronos (x402 Agentic Finance)

Link Up is a Web3 application that introduces programmable, trust-minimized relationship payments on the Cronos blockchain.

It enables two parties to form a sponsor–partner relationship and exchange value using:

Smart contract–enforced ERC-20 payments

Crypto.com x402 facilitator payments (no approval, agent-friendly)

This project explores Agentic Finance, recurring value exchange, and real-world payment UX beyond DeFi speculation.



🏆 x402 Agentic Finance

Ecosystem

Cronos EVM

Crypto.com x402 Facilitator

🧠 Problem

Current Web3 payments are:

One-off and transactional

UX-heavy (approve → transfer → confirm)

Poorly suited for ongoing relationships (sponsorships, subscriptions, pay-per-interaction)

There is no native Web3 primitive for:

“Pay this person while the relationship is active — securely, transparently, and automatically.”

💡 Solution

Link Up introduces a relationship-first payment model:

Two users form an on-chain relationship

The relationship defines:

Pricing model (daily / per-message)

Payment rules

Payments flow via:

Smart contracts (ERC-20)

x402 facilitator (no approve, AI/agent compatible)

This unlocks:

Relationship-based payments

Subscription-like flows without Web2 intermediaries

Agent-driven payments (AI can reason + pay)

✨ Key Features
🔗 Relationship Lifecycle

Propose

Accept

Pause / Resume

Terminate

💸 Payments

ERC-20 contract payments (MockUSDC)

x402 facilitator payments (no token approval)

⏱ Pricing Models

Daily rate

Per-message rate

🌐 Cronos Networks

Testnet (Chain ID: 338)

Mainnet (Chain ID: 25)

🤖 AI Assistant (Bonus)

OpenAI-powered chat

Demonstrates how agents can interact with payment systems

🏗 Architecture Overview
Frontend

Next.js 16 (App Router)

React 19

Tailwind CSS

Web3

wagmi

viem

ethers

Payments

@crypto.com/facilitator-client (x402)

Backend

Next.js API routes

Smart Contracts

Solidity

OpenZeppelin

Hardhat

📂 Key Code Locations
Dashboard UI          src/app/dashboard/page.tsx
Payment Flow          src/components/payment/PaymentFlow.tsx
Relationship Logic    src/components/relationship/ProposeRelationship.tsx
x402 API              src/app/api/x402/route.ts
AI API                src/app/api/ai/route.ts
Contracts             contracts/

🧪 How It Works (End-to-End)
1️⃣ Create Relationship

Sponsor proposes relationship

Partner accepts

Contract stores pricing rules

2️⃣ Choose Payment Method

ERC-20: approve → contract transfer

x402: sign header → verify → settle

3️⃣ Payment Enforcement

Contract enforces:

Active relationship

Correct pricing model

Valid amounts

⚡ x402 Integration (Core Innovation)

Why x402 matters

No approve flow

Perfect for AI agents

Cleaner UX

Server-verifiable settlement

Flow

Client

facilitator.generatePaymentHeader({
  to,
  value,
  signer,
  validBefore
})

facilitator.generatePaymentRequirements({
  payTo,
  description,
  maxAmountRequired
})


Server

verifyPayment()
settlePayment()

Endpoint
POST /api/x402
GET  /api/x402?action=supported


This demonstrates real-world agent-compatible payments on Cronos.

🧠 AI Agent Angle

The OpenAI-powered assistant shows how:

An agent can reason about relationships

Initiate x402 payments

Operate without holding private keys directly

This positions Link Up as a foundation for autonomous financial agents.

📦 Smart Contracts
RelationshipManager.sol

Stores relationships

Enforces lifecycle rules

Controls payment eligibility

MockUSDC.sol

ERC-20 token for testing

Cronos Testnet Deployment
Contract	Address
RelationshipManager	0x5e18Ac204b5A8a22eB5bAA3Dd2Ac3d551e80449c
MockUSDC	0x81a2fe069326142a3F1Dc8185D9FCfb90f2956A6
Chain ID	338
🛠 Setup Instructions
Prerequisites

Node.js 18+

MetaMask / WalletConnect

CRO for gas

Install & Run
git clone https://github.com/your-org/link-up-app.git
cd link-up-app
npm install
npm run dev

🔐 Environment Variables
NEXT_PUBLIC_CRONOS_NETWORK=testnet
NEXT_PUBLIC_RELATIONSHIP_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x...
OPENAI_API_KEY=sk-...

🧪 Testing Checklist

✅ Relationship proposal & acceptance

✅ ERC-20 payment enforcement

✅ x402 verify + settle

✅ Network validation (338 / 25)

✅ AI chat interaction

🧩 Why This Wins

✅ Real x402 usage (not mocked)

✅ Strong Agentic Finance narrative

✅ Practical Web3 UX improvement

✅ Built on Cronos EVM

✅ Extensible to:

Subscriptions

Creator sponsorships

AI-managed relationships

🔮 Future Work

Streaming payments

Dispute resolution

Multi-token support

ZK relationship privacy

Autonomous AI payers

🙌 Acknowledgements

Crypto.com x402

Cronos EVM

Next.js & Vercel

wagmi / viem / ethers

OpenZeppelin

🏁 Closing Note

Link Up is not a dating app —
it’s a new primitive for relationship-based payments in Web3.

Where relationships define value,
and agents can reason, decide, and pay.