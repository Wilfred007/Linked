import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        // Get relationships where user is sponsor or partner
        const relationships = await prisma.relationship.findMany({
            where: {
                OR: [
                    { sponsorId: userId },
                    { partnerId: userId },
                ],
            },
            include: {
                sponsor: true,
                partner: true,
                payments: {
                    orderBy: { timestamp: "desc" },
                    take: 5,
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        return NextResponse.json(relationships);
    } catch (error) {
        console.error("Error fetching relationships:", error);
        return NextResponse.json(
            { error: "Failed to fetch relationships" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            sponsorId,
            partnerId,
            status,
            pricingModel,
            rate,
            txHash,
        } = body;

        // Create or update relationship
        const relationship = await prisma.relationship.upsert({
            where: {
                id: txHash, // Use txHash as unique identifier
            },
            update: {
                status,
                updatedAt: new Date(),
            },
            create: {
                id: txHash,
                sponsorId,
                partnerId,
                status,
                pricingModel,
                rate,
            },
        });

        return NextResponse.json(relationship, { status: 201 });
    } catch (error) {
        console.error("Error creating/updating relationship:", error);
        return NextResponse.json(
            { error: "Failed to create/update relationship" },
            { status: 500 }
        );
    }
}
