"use client";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import RelationshipManagerABI from "@/lib/abis/RelationshipManager.json";
import { contracts } from "@/lib/wagmi";

interface RelationshipCardProps {
    relationshipId: string;
    sponsor: string;
    partner: string;
    status: string;
    pricingModel: string;
    rate: string;
    totalPaid: string;
    messageCount: number;
    isUserSponsor: boolean;
}

export default function RelationshipCard({
    relationshipId,
    sponsor,
    partner,
    status,
    pricingModel,
    rate,
    totalPaid,
    messageCount,
    isUserSponsor,
}: RelationshipCardProps) {
    const { address } = useAccount();
    const { writeContract, isPending } = useWriteContract();

    const handleAccept = () => {
        writeContract({
            address: contracts.relationshipManager,
            abi: RelationshipManagerABI,
            functionName: "acceptRelationship",
            args: [relationshipId as `0x${string}`],
        });
    };

    const handlePause = () => {
        writeContract({
            address: contracts.relationshipManager,
            abi: RelationshipManagerABI,
            functionName: "pauseRelationship",
            args: [relationshipId as `0x${string}`],
        });
    };

    const handleResume = () => {
        writeContract({
            address: contracts.relationshipManager,
            abi: RelationshipManagerABI,
            functionName: "resumeRelationship",
            args: [relationshipId as `0x${string}`],
        });
    };

    const handleTerminate = () => {
        if (confirm("Are you sure you want to terminate this relationship?")) {
            writeContract({
                address: contracts.relationshipManager,
                abi: RelationshipManagerABI,
                functionName: "terminateRelationship",
                args: [relationshipId as `0x${string}`],
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PROPOSED":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "ACTIVE":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "PAUSED":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
            case "TERMINATED":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-zinc-800">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold mb-2">
                        {isUserSponsor ? "Sponsoring" : "Receiving from"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {isUserSponsor ? partner.slice(0, 10) + "..." : sponsor.slice(0, 10) + "..."}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Pricing Model:</span>
                    <span className="font-medium">{pricingModel === "0" ? "Daily" : "Per Message"}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Rate:</span>
                    <span className="font-medium">{rate} USDC</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Paid:</span>
                    <span className="font-medium">{totalPaid} USDC</span>
                </div>
                {pricingModel === "1" && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Messages:</span>
                        <span className="font-medium">{messageCount}</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                {status === "PROPOSED" && !isUserSponsor && (
                    <button
                        onClick={handleAccept}
                        disabled={isPending}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                        Accept
                    </button>
                )}
                {status === "ACTIVE" && (
                    <button
                        onClick={handlePause}
                        disabled={isPending}
                        className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                        Pause
                    </button>
                )}
                {status === "PAUSED" && (
                    <button
                        onClick={handleResume}
                        disabled={isPending}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                        Resume
                    </button>
                )}
                {(status === "ACTIVE" || status === "PAUSED") && (
                    <button
                        onClick={handleTerminate}
                        disabled={isPending}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                        Terminate
                    </button>
                )}
            </div>
        </div>
    );
}
