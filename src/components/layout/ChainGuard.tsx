"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { cronosTestnet } from "wagmi/chains";

export function ChainGuard() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending, error } = useSwitchChain();
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    if (!isConnected) return; // only prompt when wallet is connected
    if (chainId === cronosTestnet.id) return; // already correct network
    if (asked) return; // avoid spamming prompts

    setAsked(true);
    // Fire and forget; user will get MM prompt
    switchChainAsync({ chainId: cronosTestnet.id }).catch(() => {
      /* user rejected or provider unsupported; keep banner */
    });
  }, [isConnected, chainId, switchChainAsync, asked]);

  if (!isConnected || chainId === cronosTestnet.id) return null;

  return (
    <div className="w-full bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100 py-2 px-4 text-sm flex items-center justify-between">
      <span>Wrong network detected. Please switch to Cronos Testnet (Chain ID 338) to use the app.</span>
      <button
        onClick={() => switchChainAsync({ chainId: cronosTestnet.id })}
        disabled={isPending}
        className="ml-4 px-3 py-1 rounded bg-yellow-600 text-white disabled:opacity-50"
      >
        {isPending ? "Switching..." : "Switch Network"}
      </button>
    </div>
  );
}
