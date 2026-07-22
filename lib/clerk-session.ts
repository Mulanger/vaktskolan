import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

const remoteJwksByUrl = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export class ClerkAuthenticationError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "ClerkAuthenticationError";
  }
}

function getSessionToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7).trim();

  const cookieHeader = request.headers.get("cookie") || "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("__session="));
  return sessionCookie ? decodeURIComponent(sessionCookie.slice("__session=".length)) : "";
}

function getClerkJwksUrl() {
  const configured = process.env.CLERK_JWKS_URL?.trim();
  if (configured) return configured;

  const frontendApi = process.env.CLERK_FRONTEND_API_URL?.trim();
  if (!frontendApi) throw new Error("CLERK_JWKS_URL or CLERK_FRONTEND_API_URL must be configured.");
  return `${frontendApi.replace(/\/+$/, "")}/.well-known/jwks.json`;
}

function getClerkIssuer() {
  const configured = process.env.CLERK_FRONTEND_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return getClerkJwksUrl().replace(/\/\.well-known\/jwks\.json$/, "");
}

function getAuthorizedParties() {
  const configured = process.env.CLERK_AUTHORIZED_PARTIES
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (configured?.length) return configured.map((value) => new URL(value).origin);
  return [new URL(process.env.SITE_URL || "https://vaktskolan.se").origin];
}

function getRemoteJwks(url: string) {
  const cached = remoteJwksByUrl.get(url);
  if (cached) return cached;
  const remoteJwks = createRemoteJWKSet(new URL(url));
  remoteJwksByUrl.set(url, remoteJwks);
  return remoteJwks;
}

export async function requireClerkUserId(request: Request) {
  const token = getSessionToken(request);
  if (!token) throw new ClerkAuthenticationError();

  try {
    const { payload } = await jwtVerify(token, getRemoteJwks(getClerkJwksUrl()), {
      algorithms: ["RS256"],
      issuer: getClerkIssuer(),
    });
    const authorizedParties = getAuthorizedParties();
    if (typeof payload.azp !== "string" || !authorizedParties.includes(payload.azp)) {
      throw new ClerkAuthenticationError("The Clerk session was issued for an unauthorized origin.");
    }
    if (typeof payload.sub !== "string" || !payload.sub.startsWith("user_")) {
      throw new ClerkAuthenticationError("The Clerk session does not contain a valid user.");
    }
    return payload.sub;
  } catch (error) {
    if (error instanceof ClerkAuthenticationError) throw error;
    throw new ClerkAuthenticationError("The Clerk session could not be verified.");
  }
}

