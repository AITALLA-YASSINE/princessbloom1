import { NextResponse, connection } from "next/server";
import { getPayPalConfig } from "@/lib/paypal";
import { getD1Config } from "@/lib/d1-orders";

export async function GET() {
  await connection();
  try {
    const config = getPayPalConfig(); getD1Config();
    return NextResponse.json({ enabled: true, clientId: config.clientId, mode: config.mode }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ enabled: false }, { headers: { "Cache-Control": "no-store" } }); }
}
