import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestHost = (forwardedHost || request.headers.get("host") || request.nextUrl.hostname)
    .toLowerCase()
    .split(":")[0];

  if (requestHost === "www.vaktskolan.se") {
    const canonical = request.nextUrl.clone();
    canonical.protocol = "https:";
    canonical.hostname = "vaktskolan.se";
    canonical.port = "";
    return NextResponse.redirect(canonical, 308);
  }

  const response = NextResponse.next();
  const configuredHost = (() => {
    try {
      return new URL(process.env.SITE_URL || "https://vaktskolan.se").hostname.toLowerCase();
    } catch {
      return "vaktskolan.se";
    }
  })();
  const isProduction = process.env.APP_ENV?.toLowerCase() === "production";
  const isCanonicalHost = requestHost === configuredHost;

  if (!isProduction || !isCanonicalHost) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|site-assets).*)"],
};
