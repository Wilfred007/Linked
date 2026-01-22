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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-red-50 to-pink-50 dark:from-zinc-950 dark:via-red-950 dark:to-pink-950 relative overflow-hidden">
                {/* Decorative gradient orbs */}
                <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-br from-red-300 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 left-20 w-96 h-96 bg-gradient-to-br from-pink-300 to-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

                <div className="relative z-10 text-center px-6">
                    {/* Heart icon */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-red-500 to-pink-500 rounded-full p-4 w-20 h-20 flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-white animate-bounce"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 via-pink-600 to-rose-500 bg-clip-text text-transparent">
                        Link Up
                    </h1>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                        Connect your wallet to find your perfect match
                    </p>
                    <WalletConnect />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-pink-50 dark:from-zinc-950 dark:via-red-950 dark:to-pink-950">
            {/* Decorative background orbs */}
            <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-300 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>
            <div className="fixed -bottom-32 left-0 w-96 h-96 bg-gradient-to-br from-pink-300 to-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>

            <nav className="relative z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-md border-b border-red-200/30 dark:border-red-900/30">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Link Up</h1>
                    </div>
                    <WalletConnect />
                </div>
            </nav>

            <div className="relative z-10 container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Propose Relationship */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <ProposeRelationship />

                            {selectedRelationship && (
                                <div className="mt-6 animate-fade-in">
                                    <PaymentFlow
                                        relationshipId={selectedRelationship}
                                        rate="10"
                                        pricingModel="0"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Relationships List */}
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                Your Connections
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and nurture your relationships</p>
                        </div>

                        {!relationshipIds || (relationshipIds as any[]).length === 0 ? (
                            <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-red-200/30 dark:border-red-900/30 shadow-lg p-12 text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                                    Start your journey!
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Propose a relationship to find your perfect match
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div 
            onClick={() => onSelectForPayment(relationshipId)} 
            className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
        >
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all duration-300"></div>
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
        </div>
    );
}
