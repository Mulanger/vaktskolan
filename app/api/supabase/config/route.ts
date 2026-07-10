import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const url = process.env.SUPABASE_URL || "";
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || "";
  const status = url && publishableKey ? 200 : 503;
  return NextResponse.json(
    status === 200
      ? { ok: true, url, publishableKey, jwksUrl: process.env.SUPABASE_JWKS_URL || "" }
      : { ok: false, error: "Supabase environment variables are missing." },
    { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } },
  );
}
