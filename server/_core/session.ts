import { ONE_YEAR_MS, COOKIE_NAME } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";

if (!ENV.jwtSecret) {
  console.error(
    "[Session] ERROR: JWT_SECRET is not configured! Set the JWT_SECRET environment variable (e.g. `openssl rand -base64 48`)."
  );
}

type SessionPayload = { userId: number };

function getSecretKey() {
  return new TextEncoder().encode(ENV.jwtSecret);
}

export async function createSessionToken(
  userId: number,
  options: { expiresInMs?: number } = {}
): Promise<string> {
  const issuedAt = Date.now();
  const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
  const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);

  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    const userId = payload.userId;
    if (typeof userId !== "number") return null;
    return { userId };
  } catch (error) {
    console.warn("[Session] Verification failed:", String(error));
    return null;
  }
}

export function getSessionTokenFromRequest(req: Request): string | undefined {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const cookieToken = cookies[COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return undefined;
}
