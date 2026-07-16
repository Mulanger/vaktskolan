import { createReadStream, existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const initialEnvKeys = new Set(Object.keys(process.env));

loadEnvFiles();

const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "0.0.0.0";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function loadEnvFiles() {
  loadEnvFile(join(root, ".env"), false);
  loadEnvFile(join(root, ".env.local"), true);
}

function loadEnvFile(envPath, overrideLoadedValues) {
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (!key || initialEnvKeys.has(key)) continue;
    if (!overrideLoadedValues && Object.prototype.hasOwnProperty.call(process.env, key)) continue;

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL || "",
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || "",
    secretKey: process.env.SUPABASE_SECRET_KEY || "",
    jwksUrl: process.env.SUPABASE_JWKS_URL || "",
  };
}

function getClerkConfig() {
  const publishableKey =
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    "";
  const frontendApiUrl = process.env.CLERK_FRONTEND_API_URL || getDefaultClerkFrontendApiUrl();

  return {
    publishableKey,
    frontendApiUrl,
    backendApiUrl: process.env.CLERK_BACKEND_API_URL || "",
    jwksUrl: process.env.CLERK_JWKS_URL || (frontendApiUrl ? `${frontendApiUrl}/.well-known/jwks.json` : ""),
  };
}

function getDefaultClerkFrontendApiUrl() {
  const siteUrl = process.env.SITE_URL || "";
  if (!siteUrl) return "";

  try {
    const hostname = new URL(siteUrl).hostname.replace(/^www\./, "");
    return `https://clerk.${hostname}`;
  } catch {
    return "";
  }
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function handleClerkConfig(response) {
  const config = getClerkConfig();
  const isProduction = process.env.APP_ENV?.toLowerCase() === "production";
  const isLiveKey = config.publishableKey.startsWith("pk_live_");
  const ok = Boolean(config.publishableKey && (!isProduction || isLiveKey));
  const allowUnauthenticatedPreview =
    !isProduction && process.env.ALLOW_UNAUTHENTICATED_PLATFORM_PREVIEW?.toLowerCase() === "true";

  sendJson(response, 200, {
    ok,
    publishableKey: ok ? config.publishableKey : "",
    frontendApiUrl: ok ? config.frontendApiUrl : "",
    jwksUrl: ok ? config.jwksUrl : "",
    allowUnauthenticatedPreview,
    error: config.publishableKey && isProduction && !isLiveKey ? "Clerk production publishable key is required." : undefined,
    signInUrl: "/login.html?mode=sign-in",
    signUpUrl: "/login.html?mode=sign-up",
    afterSignInUrl: "/platform",
    afterSignUpUrl: "/platform",
  });
}

function handleSupabaseConfig(response) {
  const config = getSupabaseConfig();
  if (!config.url || !config.publishableKey) {
    sendJson(response, 503, {
      ok: false,
      error: "Supabase environment variables are missing.",
    });
    return;
  }

  sendJson(response, 200, {
    ok: true,
    url: config.url,
    publishableKey: config.publishableKey,
    jwksUrl: config.jwksUrl,
  });
}

async function handleSupabaseHealth(response) {
  const config = getSupabaseConfig();
  const apiKey = config.secretKey || config.publishableKey;

  if (!config.url || !apiKey) {
    sendJson(response, 503, {
      ok: false,
      error: "Supabase environment variables are missing.",
    });
    return;
  }

  try {
    const supabaseUrl = `${config.url.replace(/\/+$/, "")}/rest/v1/`;
    const supabaseResponse = await fetch(supabaseUrl, {
      headers: {
        Accept: "application/json",
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
      },
    });

    let errorMessage = "";
    if (!supabaseResponse.ok) {
      const text = await supabaseResponse.text();
      try {
        errorMessage = JSON.parse(text)?.message || text;
      } catch {
        errorMessage = text;
      }
    }

    sendJson(response, supabaseResponse.ok ? 200 : 502, {
      ok: supabaseResponse.ok,
      status: supabaseResponse.status,
      statusText: supabaseResponse.statusText,
      error: errorMessage || undefined,
    });
  } catch (error) {
    sendJson(response, 502, {
      ok: false,
      error: error instanceof Error ? error.message : "Supabase health check failed.",
    });
  }
}

function resolveRequest(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  if (pathname === "/") return join(root, "landing", "index.html");
  if (pathname === "/platform") return join(root, "index.html");
  if (pathname === "/login" || pathname === "/sign-in" || pathname === "/sign-up") return join(root, "login.html");
  if (pathname === "/landing" || pathname === "/landing/") return join(root, "landing", "index.html");
  if (pathname === "/quiz-demo" || pathname === "/quiz-demo/" || pathname === "/landing/quiz-demo" || pathname === "/landing/quiz-demo/") {
    return join(root, "landing", "quiz-demo.html");
  }
  if (pathname === "/studieteknik" || pathname === "/studieteknik/" || pathname === "/landing/studieteknik" || pathname === "/landing/studieteknik/") {
    return join(root, "landing", "studieteknik.html");
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  if (pathSegments.some((segment) => segment.startsWith("."))) return null;

  const requested = pathname;
  const resolved = normalize(join(root, requested));
  const relativePath = relative(root, resolved);

  if (relativePath.startsWith("..") || relativePath === "..") return null;
  return existsSync(resolved) ? resolved : join(root, "index.html");
}

createServer(async (request, response) => {
  const pathname = new URL(request.url || "/", `http://${host}:${port}`).pathname;

  if (pathname === "/api/supabase/config") {
    handleSupabaseConfig(response);
    return;
  }

  if (pathname === "/api/supabase/health") {
    await handleSupabaseHealth(response);
    return;
  }

  if (pathname === "/api/clerk/config") {
    handleClerkConfig(response);
    return;
  }

  const file = resolveRequest(request.url || "/");

  if (!file) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  const type = mimeTypes[extname(file)] || "application/octet-stream";
  response.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": "no-store",
  });
  createReadStream(file).pipe(response);
}).listen(port, host, () => {
  console.log(`Vaktskolan running at http://${host}:${port}`);
});
