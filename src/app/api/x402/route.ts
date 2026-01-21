import { NextResponse } from "next/server";
import { Facilitator, CronosNetwork } from "@crypto.com/facilitator-client";

function getNetwork(): CronosNetwork {
  const env = (process.env.NEXT_PUBLIC_CRONOS_NETWORK || process.env.CRONOS_NETWORK || "testnet").toLowerCase();
  return env === "mainnet" ? CronosNetwork.CronosMainnet : CronosNetwork.CronosTestnet;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    const facilitator = new Facilitator({ network: getNetwork() });

    if (action === "supported") {
      const supported = await facilitator.getSupported();
      return NextResponse.json(supported);
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err) {
    console.error("/api/x402 GET error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, header, requirements } = body || {};

    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }
    if ((action === "verify" || action === "settle") && (!header || !requirements)) {
      return NextResponse.json({ error: "header and requirements are required" }, { status: 400 });
    }

    const facilitator = new Facilitator({ network: getNetwork() });

    if (action === "verify") {
      const request = facilitator.buildVerifyRequest(header, requirements);
      const resp = await facilitator.verifyPayment(request);
      return NextResponse.json(resp);
    }

    if (action === "settle") {
      const request = facilitator.buildVerifyRequest(header, requirements);
      const resp = await facilitator.settlePayment(request);
      return NextResponse.json(resp);
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err) {
    console.error("/api/x402 POST error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
