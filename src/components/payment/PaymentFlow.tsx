"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import { ethers } from "ethers";
import { Facilitator, CronosNetwork } from "@crypto.com/facilitator-client";

import { contracts } from "@/lib/wagmi";
import RelationshipManagerABI from "@/lib/abis/RelationshipManager.json";
import MockUSDCABI from "@/lib/abis/MockUSDC.json";

interface PaymentFlowProps {
  relationshipId: string;
  rate: string;
  pricingModel: string;
}

export default function PaymentFlow({
  relationshipId,
  rate,
  pricingModel,
}: PaymentFlowProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState(rate);

  /* ---------------- X402 STATE ---------------- */
  const [isX402Busy, setIsX402Busy] = useState(false);
  const [x402Message, setX402Message] = useState<string | null>(null);
  const [x402TxHash, setX402TxHash] = useState<string | null>(null);

  /* ---------------- READ CONTRACTS ---------------- */
  const { data: relationship } = useReadContract({
    address: contracts.relationshipManager,
    abi: RelationshipManagerABI,
    functionName: "getRelationship",
    args: [relationshipId],
  });

  const { data: allowance } = useReadContract({
    address: contracts.mockUSDC,
    abi: MockUSDCABI,
    functionName: "allowance",
    args: [address!, contracts.relationshipManager],
  });

  /* ---------------- WRITE CONTRACTS ---------------- */
  const { writeContract: approve, data: approveHash, isPending: isApproving } =
    useWriteContract();
  const { isLoading: isApprovingConfirming } =
    useWaitForTransactionReceipt({ hash: approveHash });

  const {
    writeContract: makePayment,
    data: paymentHash,
    isPending: isPaying,
  } = useWriteContract();
  const { isLoading: isPayingConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: paymentHash });

  /* ---------------- HELPERS ---------------- */
  const amountParsed = useMemo(
    () => parseUnits(amount || "0", 6),
    [amount]
  );

  const needsApproval =
    !allowance || BigInt(allowance.toString()) < amountParsed;

  const isAnyBusy =
    isApproving ||
    isApprovingConfirming ||
    isPaying ||
    isPayingConfirming ||
    isX402Busy;

  const getCounterparty = (): string | null => {
    if (!relationship || !address) return null;
    const [sponsor, partner] = relationship as any[];
    return sponsor.toLowerCase() === address.toLowerCase()
      ? partner
      : sponsor;
  };

  const getCronosNetwork = (): CronosNetwork => {
    return process.env.NEXT_PUBLIC_CRONOS_NETWORK === "mainnet"
      ? CronosNetwork.CronosMainnet
      : CronosNetwork.CronosTestnet;
  };

  const ensureCronos = async () => {
    if (!(window as any).ethereum) throw new Error("Wallet not found");
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const network = await provider.getNetwork();
    const expected =
      getCronosNetwork() === CronosNetwork.CronosMainnet ? 25n : 338n;

    if (network.chainId !== expected) {
      throw new Error("Please switch MetaMask to Cronos network");
    }
  };

  /* ---------------- CONTRACT FLOW ---------------- */
  const handleApprove = async () => {
    await ensureCronos();
    approve({
      address: contracts.mockUSDC,
      abi: MockUSDCABI,
      functionName: "approve",
      args: [contracts.relationshipManager, amountParsed],
    });
  };

  const handleContractPayment = async () => {
    await ensureCronos();
    makePayment({
      address: contracts.relationshipManager,
      abi: RelationshipManagerABI,
      functionName: "makePayment",
      args: [relationshipId as `0x${string}`, amountParsed],
    });
  };

  /* ---------------- X402 FLOW ---------------- */
  const handleX402Payment = async () => {
    try {
      setIsX402Busy(true);
      setX402Message("Preparing X402 payment...");
      setX402TxHash(null);

      await ensureCronos();

      const payTo = getCounterparty();
      if (!payTo) throw new Error("Counterparty not resolved");

      const facilitator = new Facilitator({
        network: getCronosNetwork(),
      });

      const provider = new ethers.BrowserProvider(
        (window as any).ethereum
      );
      const signer = await provider.getSigner();

      const value = amountParsed.toString();

      const header = await facilitator.generatePaymentHeader({
        to: payTo,
        value,
        signer,
        validBefore: Math.floor(Date.now() / 1000) + 600,
      });

      const requirements = facilitator.generatePaymentRequirements({
        payTo,
        description:
          pricingModel === "0"
            ? "Daily relationship payment"
            : "Per-message relationship payment",
        maxAmountRequired: value,
      });

      setX402Message("Verifying payment...");
      const verify = await fetch("/api/x402", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", header, requirements }),
      });

      if (!verify.ok) throw new Error("X402 verification failed");

      setX402Message("Settling on-chain...");
      const settle = await fetch("/api/x402", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "settle", header, requirements }),
      });

      if (!settle.ok) throw new Error("X402 settlement failed");

      const res = await settle.json();
      setX402TxHash(res.txHash || res.transactionHash);
      setX402Message("Payment settled successfully");
    } catch (err: any) {
      setX402Message(err.message || "X402 payment failed");
    } finally {
      setIsX402Busy(false);
    }
  };

  /* ---------------- POST-SUCCESS ---------------- */
  useEffect(() => {
    if (!isSuccess) return;
    const t = setTimeout(() => window.location.reload(), 2000);
    return () => clearTimeout(t);
  }, [isSuccess]);

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Make Payment</h3>

      <label className="block text-sm font-medium mb-2">Amount (USDC)</label>
      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
      />

      <p className="text-xs text-gray-500 mt-1">
        Suggested: {rate} USDC{" "}
        {pricingModel === "0" ? "per day" : "per message"}
      </p>

      <div className="mt-4 space-y-3">
        {needsApproval ? (
          <button
            onClick={handleApprove}
            disabled={isAnyBusy}
            className="w-full py-3 bg-yellow-600 text-white rounded-lg disabled:opacity-50"
          >
            {isApproving || isApprovingConfirming
              ? "Approving..."
              : "Approve USDC"}
          </button>
        ) : (
          <button
            onClick={handleContractPayment}
            disabled={isAnyBusy}
            className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {isPaying || isPayingConfirming
              ? "Processing..."
              : "Send Payment"}
          </button>
        )}

        <div className="pt-4 border-t dark:border-zinc-800">
          <button
            onClick={handleX402Payment}
            disabled={isAnyBusy || !relationship}
            className="w-full py-3 bg-purple-600 text-white rounded-lg disabled:opacity-50"
          >
            {isX402Busy ? "Processing X402..." : "Pay via X402 (no approve)"}
          </button>

          {x402Message && (
            <p className="text-xs text-gray-500 mt-2">{x402Message}</p>
          )}
          {x402TxHash && (
            <p className="text-xs text-gray-500">
              Tx: {x402TxHash.slice(0, 10)}...
              {x402TxHash.slice(-8)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
