import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.SUPABASE_URL || "";
  const apiKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "";
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

  if (!url || !apiKey) {
    return NextResponse.json({ ok: false, error: "Supabase environment variables are missing." }, { status: 503, headers });
  }

  try {
    const response = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/`, {
      cache: "no-store",
      headers: { Accept: "application/json", apikey: apiKey, Authorization: `Bearer ${apiKey}` },
    });
    return NextResponse.json(
      { ok: response.ok, status: response.status, statusText: response.statusText },
      { status: response.ok ? 200 : 502, headers },
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Supabase health check failed." },
      { status: 502, headers },
    );
  }
}
