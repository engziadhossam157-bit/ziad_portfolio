import { OAUTH_STATE_COOKIE, COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import { upsertGoogleUser } from "../db";
import { getSessionCookieOptions } from "./cookies";
import {
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  getGoogleUserInfo,
  isGoogleLoginConfigured,
} from "./google";
import { createSessionToken } from "./session";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerGoogleAuthRoutes(app: Express) {
  app.get("/api/auth/google/start", (req: Request, res: Response) => {
    if (!isGoogleLoginConfigured()) {
      res.status(503).send("Google login is not configured on this server.");
      return;
    }

    const nonce = crypto.randomUUID();
    res.cookie(OAUTH_STATE_COOKIE, nonce, {
      path: "/",
      maxAge: 600_000,
      sameSite: "none",
      secure: true,
      httpOnly: true,
    });

    res.redirect(302, buildGoogleAuthUrl(nonce));
  });

  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    if (!isGoogleLoginConfigured()) {
      res.status(503).send("Google login is not configured on this server.");
      return;
    }

    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!expectedNonce || state !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });

    try {
      const tokenResponse = await exchangeGoogleCode(code);
      const userInfo = await getGoogleUserInfo(tokenResponse.access_token);

      if (!userInfo.email) {
        res.status(400).json({ error: "Google account has no email" });
        return;
      }

      const userId = await upsertGoogleUser({
        email: userInfo.email,
        googleId: userInfo.sub,
        name: userInfo.name ?? null,
      });

      const sessionToken = await createSessionToken(userId, { expiresInMs: ONE_YEAR_MS });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[GoogleAuth] Callback failed", error);
      res.status(500).json({ error: "Google login failed" });
    }
  });
}
