import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerGoogleAuthRoutes } from "./googleRoutes";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { buildRobotsTxt, buildSitemapXml } from "./seo";

/** The Express app without page serving: the long-running server (index.ts) and the Vercel function (vercel.ts) both add that themselves. */
export function createApp() {
  const app = express();
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerGoogleAuthRoutes(app);
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain").send(buildRobotsTxt(req));
  });
  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml").send(buildSitemapXml(req));
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  return app;
}
