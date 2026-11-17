import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse, connection } from "next/server";
import { getD1Config } from "@/lib/d1-orders";
import { hash, expires } from "@/lib/wallet-debug-config";

function authorized(key: unknown) {
  return Date.now() < expires && typeof key === "string" && /^[a-f0-9]{64}$/.test(key)
    && timingSafeEqual(Buffer.from(createHash("sha256").update(key).digest("hex")), Buffer.from(hash));
}
async function query(sql: string, params: (string | number)[] = []) {
  const config = getD1Config();
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.account}/d1/database/${config.database}/query`, { method: "POST", headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" }, body: JSON.stringify({ sql, params }), cache: "no-store", signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  if (!response.ok || !data.success || data.result?.some((item: { success: boolean }) => !item.success)) throw new Error("diagnostic_unavailable");
  return data.result[0].results;
}
async function prepare() {
  await query("CREATE TABLE IF NOT EXISTS diagnostic_wallets (id INTEGER PRIMARY KEY AUTOINCREMENT, canal TEXT NOT NULL, evenement TEXT NOT NULL, details TEXT NOT NULL, cree_le TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)");
}

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > 6000) return new Response(null, { status: 400 });
    const body = JSON.parse(text);
    if (!authorized(body.key)) return new Response(null, { status: 404 });
    if (!["page","context","mount","mount-start","ready","availability","change","payment-ready","loaderror"].includes(body.event)) return new Response(null, { status: 400 });
    // Strict whitelist: no names, addresses, email, card data, keys or raw errors.
    const details: Record<string, unknown> = {};
    for (const field of ["stripe","elements","secure","embedded","publicKey","available"]) if (typeof body[field] === "boolean") details[field] = body[field];
    for (const field of ["cartItems","rootWidth"]) if (Number.isFinite(body[field])) details[field] = Math.max(0, Math.min(10000, body[field]));
    if (["Firefox","Edge","Chromium","Safari","other"].includes(body.browser)) details.browser = body.browser;
    if (Array.isArray(body.frames)) details.frames = body.frames.slice(0,5).map((frame: { width?: number; height?: number }) => ({ width: Math.max(0,Math.min(10000,Number(frame.width)||0)), height: Math.max(0,Math.min(10000,Number(frame.height)||0)) }));
    if (body.methods && typeof body.methods === "object") details.methods = Object.fromEntries(["applePay","googlePay","link","paypal","klarna","amazonPay"].map(method => [method, typeof body.methods[method] === "boolean" ? body.methods[method] : Boolean(body.methods[method]?.available)]));
    await prepare();
    await query("INSERT INTO diagnostic_wallets (canal,evenement,details) VALUES (?,?,?)",[hash,body.event,JSON.stringify(details)]);
    return new Response(null, { status: 204 });
  } catch { return new Response(null, { status: 503 }); }
}
export async function GET(request: Request) {
  await connection();
  if (!authorized(new URL(request.url).searchParams.get("key"))) return new Response(null, { status: 404 });
  try {
    await prepare();
    const rows = await query("SELECT evenement,details,cree_le FROM diagnostic_wallets WHERE canal=? ORDER BY id DESC LIMIT 40",[hash]);
    return NextResponse.json(rows, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ unavailable: true }, { status: 503 }); }
}
