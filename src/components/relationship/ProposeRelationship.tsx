"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { contracts } from "@/lib/wagmi";
import RelationshipManagerABI from "@/lib/abis/RelationshipManager.json";

export default function ProposeRelationship() {
    const { address } = useAccount();
    const [formData, setFormData] = useState({
        partnerAddress: "",
        pricingModel: "0", // 0 = DAILY, 1 = PER_MESSAGE
        rate: "",
    });

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!address || !contracts.relationshipManager) {
            alert("Please connect your wallet and ensure contracts are deployed");
            return;
        }

        try {
            // Convert rate to USDC format (6 decimals)
            const rateInUSDC = parseUnits(formData.rate, 6);

            writeContract({
                address: contracts.relationshipManager,
                abi: RelationshipManagerABI,
                functionName: "proposeRelationship",
                args: [
                    formData.partnerAddress as `0x${string}`,
                    parseInt(formData.pricingModel),
                    rateInUSDC,
                ],
            });
        } catch (error) {
            console.error("Error proposing relationship:", error);
            alert("Failed to propose relationship");
        }
    };

    if (isSuccess) {
        setTimeout(() => {
            setFormData({ partnerAddress: "", pricingModel: "0", rate: "" });
            window.location.reload();
        }, 2000);
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Propose Relationship</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Partner Address</label>
                    <input
                        type="text"
                        value={formData.partnerAddress}
                        onChange={(e) => setFormData({ ...formData, partnerAddress: e.target.value })}
                        placeholder="0x..."
                        required
                        className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Pricing Model</label>
                    <select
                        value={formData.pricingModel}
                        onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
                        className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                    >
                        <option value="0">Daily Subscription</option>
                        <option value="1">Per Message</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Rate (USDC {formData.pricingModel === "0" ? "per day" : "per message"})
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                        placeholder="10.00"
                        required
                        className="w-full p-3 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending || isConfirming}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? "Confirming..." : isConfirming ? "Processing..." : isSuccess ? "Success!" : "Propose Relationship"}
                </button>

                {hash && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
                    </p>
                )}
            </form>
        </div>
    );
}
