// Builds Vercel's Build Output API layout (.vercel/output): the Vite client as static
// files plus one Node function for everything else. Run by Vercel via `pnpm build:vercel`.
import { build } from "esbuild";
import { execSync } from "node:child_process";
import fs from "node:fs";

const out = ".vercel/output";
const fn = `${out}/functions/api.func`;
fs.rmSync(out, { recursive: true, force: true });

execSync("npx vite build", { stdio: "inherit" });
fs.cpSync("dist/public", `${out}/static`, { recursive: true });
// index.html must not be served as a static file, or "/" would skip the per-route meta tags.
fs.rmSync(`${out}/static/index.html`);
fs.mkdirSync(fn, { recursive: true });
fs.copyFileSync("dist/public/index.html", `${fn}/app.html`);

await build({
  entryPoints: ["server/_core/vercel.ts"],
  outfile: `${fn}/index.mjs`,
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  // The node build of @libsql/client loads a native SQLite binding for file: URLs; the web
  // build talks to Turso over HTTP only, which is all production needs, and bundles cleanly.
  alias: { "@libsql/client": "@libsql/client/web" },
  // Bundled CommonJS dependencies (express) still call require() for Node built-ins.
  banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
  logLevel: "warning",
});

fs.writeFileSync(`${fn}/.vc-config.json`, JSON.stringify({ runtime: "nodejs22.x", handler: "index.mjs", launcherType: "Nodejs", shouldAddHelpers: false, maxDuration: 30 }, null, 2));
fs.writeFileSync(`${out}/config.json`, JSON.stringify({
  version: 3,
  routes: [
    { src: "^/assets/(.*)$", headers: { "cache-control": "public, max-age=31536000, immutable" }, continue: true },
    { handle: "filesystem" },
    { src: "^/(.*)$", dest: "/api?__p=/$1" },
  ],
}, null, 2));
console.log("Vercel build output ready in .vercel/output");
