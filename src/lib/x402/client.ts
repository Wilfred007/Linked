import { CronosNetwork } from "@crypto.com/facilitator-client";

export function getCronosNetwork(): CronosNetwork {
  const env = (process.env.NEXT_PUBLIC_CRONOS_NETWORK || "testnet").toLowerCase();
  return env === "mainnet" ? (1 as unknown as CronosNetwork) : (0 as unknown as CronosNetwork);
}

export async function getSupported() {
  const res = await fetch("/api/x402?action=supported", { cache: "no-store" });
  if (!res.ok) throw new Error(`getSupported failed: ${res.status}`);
  return res.json();
}

export async function verifyPayment(payload: { header: string; requirements: any }) {
  const res = await fetch("/api/x402", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "verify", ...payload }),
  });
  if (!res.ok) throw new Error(`verifyPayment failed: ${res.status}`);
  return res.json();
}

export async function settlePayment(payload: { header: string; requirements: any }) {
  const res = await fetch("/api/x402", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "settle", ...payload }),
  });
  if (!res.ok) throw new Error(`settlePayment failed: ${res.status}`);
  return res.json();
}
