import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getDefaultFrontendApiUrl() {
  const siteUrl = process.env.SITE_URL || "https://vaktskolan.se";

  try {
    const hostname = new URL(siteUrl).hostname.replace(/^www\./, "");
    return `https://clerk.${hostname}`;
  } catch {
    return "";
  }
}

export function GET() {
  const publishableKey =
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    "";
  const isProduction = process.env.APP_ENV?.toLowerCase() === "production";
  const isLiveKey = publishableKey.startsWith("pk_live_");
  const frontendApiUrl = process.env.CLERK_FRONTEND_API_URL || getDefaultFrontendApiUrl();
  const jwksUrl = process.env.CLERK_JWKS_URL || (frontendApiUrl ? `${frontendApiUrl}/.well-known/jwks.json` : "");
  const ok = Boolean(publishableKey && (!isProduction || isLiveKey));

  return NextResponse.json(
    {
      ok,
      publishableKey: ok ? publishableKey : "",
      frontendApiUrl: ok ? frontendApiUrl : "",
      jwksUrl: ok ? jwksUrl : "",
      error: publishableKey && isProduction && !isLiveKey ? "Clerk production publishable key is required." : undefined,
      signInUrl: "/login?mode=sign-in",
      signUpUrl: "/login?mode=sign-up",
      afterSignInUrl: "/plattform",
      afterSignUpUrl: "/plattform",
    },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } },
  );
}
