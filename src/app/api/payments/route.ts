import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const relationshipId = searchParams.get("relationshipId");

        if (!relationshipId) {
            return NextResponse.json(
                { error: "relationshipId is required" },
                { status: 400 }
            );
        }

        const payments = await prisma.payment.findMany({
            where: { relationshipId },
            orderBy: { timestamp: "desc" },
        });

        return NextResponse.json(payments);
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json(
            { error: "Failed to fetch payments" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { relationshipId, txHash, amount, status } = body;

        const payment = await prisma.payment.create({
            data: {
                relationshipId,
                txHash,
                amount,
                status: status || "COMPLETED",
            },
        });

        return NextResponse.json(payment, { status: 201 });
    } catch (error) {
        console.error("Error creating payment:", error);
        return NextResponse.json(
            { error: "Failed to create payment" },
            { status: 500 }
        );
    }
}
