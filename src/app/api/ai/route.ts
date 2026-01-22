import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // ensure Node.js runtime, not Edge

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { messages, model = "gpt-4o-mini", temperature = 0.7 } = body || {};

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature,
    });

    const choice = completion.choices?.[0]?.message;
    return NextResponse.json({ message: choice });
  } catch (err: any) {
    // Surface OpenAI API errors with more detail
    const status = err?.status || 500;
    const message = err?.message || "Internal server error";
    const details = err?.error || err?.response?.data || undefined;
    console.error("/api/ai POST error", { status, message, details });
    return NextResponse.json({ error: message, details }, { status });
  }
}
