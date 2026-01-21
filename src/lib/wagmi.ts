"use client";

import { createConfig, http } from "wagmi";
import { cronosTestnet, hardhat } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// WalletConnect project ID - replace with your own
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";



export const config = createConfig({
    chains: [cronosTestnet, hardhat],
    connectors: [
        injected(),
        walletConnect({ projectId }),
    ],
    transports: {
        [cronosTestnet.id]: http(),
        [hardhat.id]: http("http://127.0.0.1:8545"),
    },
});

// Contract addresses - will be populated after deployment
export const contracts = {
    relationshipManager: process.env.NEXT_PUBLIC_RELATIONSHIP_MANAGER_ADDRESS as `0x${string}`,
    mockUSDC: process.env.NEXT_PUBLIC_MOCK_USDC_ADDRESS as `0x${string}`,
};
