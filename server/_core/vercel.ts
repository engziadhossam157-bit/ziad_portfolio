// Vercel function entry. Static files are served by Vercel's CDN; every other request
// (API, auth, sitemap, and page HTML with per-route meta) is routed here by
// scripts/build-vercel.mjs. Bundled by that script, so @shared aliases resolve.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "./app";
import { applySeoMeta } from "./seo";

const html = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "app.html"), "utf-8");
const app = createApp();
app.use("*", (req, res) => {
  res.status(200).set({ "Content-Type": "text/html" }).end(applySeoMeta(html, req));
});

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // The catch-all route rewrites to /api?__p=<original path>; put the original URL back.
  const url = new URL(req.url ?? "/", "http://localhost");
  const original = url.searchParams.get("__p");
  if (original !== null) {
    url.searchParams.delete("__p");
    req.url = original + url.search;
  }
  return app(req as never, res as never);
}
