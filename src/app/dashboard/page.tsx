"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { contracts } from "@/lib/wagmi";
import RelationshipManagerABI from "@/lib/abis/RelationshipManager.json";
import WalletConnect from "@/components/auth/WalletConnect";
import ProposeRelationship from "@/components/relationship/ProposeRelationship";
import RelationshipCard from "@/components/relationship/RelationshipCard";
import PaymentFlow from "@/components/payment/PaymentFlow";
import { formatUnits } from "viem";

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    const [selectedRelationship, setSelectedRelationship] = useState<string | null>(null);

    // Get user's relationships
    const { data: relationshipIds, refetch } = useReadContract({
        address: contracts.relationshipManager,
        abi: RelationshipManagerABI,
        functionName: "getUserRelationships",
        args: address ? [address] : undefined,
    });

    useEffect(() => {
        if (isConnected) {
            refetch();
        }
    }, [isConnected, refetch]);

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-6">Link Up Dating App</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Connect your wallet to get started
                    </p>
                    <WalletConnect />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800">
            <nav className="bg-white dark:bg-zinc-900 shadow-sm border-b border-gray-200 dark:border-zinc-800">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Link Up</h1>
                    <WalletConnect />
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Propose Relationship */}
                    <div className="lg:col-span-1">
                        <ProposeRelationship />

                        {selectedRelationship && (
                            <div className="mt-6">
                                <PaymentFlow
                                    relationshipId={selectedRelationship}
                                    rate="10"
                                    pricingModel="0"
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column: Relationships List */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-6">Your Relationships</h2>

                        {!relationshipIds || (relationshipIds as any[]).length === 0 ? (
                            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 text-center">
                                <p className="text-gray-600 dark:text-gray-400">
                                    No relationships yet. Propose one to get started!
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(relationshipIds as any[]).map((relId) => (
                                    <RelationshipDisplay
                                        key={relId}
                                        relationshipId={relId}
                                        userAddress={address!}
                                        onSelectForPayment={setSelectedRelationship}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function RelationshipDisplay({
    relationshipId,
    userAddress,
    onSelectForPayment,
}: {
    relationshipId: string;
    userAddress: string;
    onSelectForPayment: (id: string) => void;
}) {
    const { data: relationship } = useReadContract({
        address: contracts.relationshipManager,
        abi: RelationshipManagerABI,
        functionName: "getRelationship",
        args: [relationshipId],
    });

    if (!relationship) return null;

    const [sponsor, partner, status, pricingModel, rate, startDate, totalPaid, messageCount] = relationship as any[];

    const statusNames = ["PROPOSED", "ACTIVE", "PAUSED", "EXPIRED", "TERMINATED"];
    const isUserSponsor = sponsor.toLowerCase() === userAddress.toLowerCase();

    return (
        <div onClick={() => onSelectForPayment(relationshipId)} className="cursor-pointer">
            <RelationshipCard
                relationshipId={relationshipId}
                sponsor={sponsor}
                partner={partner}
                status={statusNames[status]}
                pricingModel={pricingModel.toString()}
                rate={formatUnits(rate, 6)}
                totalPaid={formatUnits(totalPaid, 6)}
                messageCount={Number(messageCount)}
                isUserSponsor={isUserSponsor}
            />
        </div>
    );
}
