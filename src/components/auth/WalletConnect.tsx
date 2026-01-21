"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function WalletConnect() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-4">
                <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Connected: </span>
                    <span className="font-mono font-semibold">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                </div>
                <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => connect({ connector: injected() })}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
            Connect Wallet
        </button>
    );
}
