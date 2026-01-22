import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { messages, model = "gpt-4o-mini" } = body || {};

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
      temperature: 0.7,
    });

    const choice = completion.choices?.[0]?.message;
    return NextResponse.json({ message: choice });
  } catch (err) {
    console.error("/api/ai POST error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
