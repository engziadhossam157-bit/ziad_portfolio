import type { Request } from "express";

type RouteMeta = { title: string; description: string; noindex?: boolean };

const PAGE_META: Record<string, RouteMeta> = {
  "/": {
    title: "Ziad Hossam | Full-Stack Developer & AI Engineer",
    description: "Ziad Hossam is a full-stack developer studying AI engineering. He builds websites, web applications, and AI-driven tools.",
  },
  "/about": {
    title: "About | Ziad Hossam",
    description: "Ziad Hossam's background, skills, and path from web development to full-stack and AI engineering.",
  },
  "/services": {
    title: "Services | Ziad Hossam",
    description: "Full-stack web development, backend and API work, automation, and AI engineering by Ziad Hossam.",
  },
  "/projects": {
    title: "Selected Work | Ziad Hossam",
    description: "Websites, web applications, and software projects built by Ziad Hossam.",
  },
  "/certificates": {
    title: "Certificates | Ziad Hossam",
    description: "Certificates and training completed by Ziad Hossam.",
  },
  "/contact": {
    title: "Contact | Ziad Hossam",
    description: "Get in touch with Ziad Hossam to start a new project or collaboration.",
  },
  "/start-project": {
    title: "Start a Project | Ziad Hossam",
    description: "Tell Ziad Hossam about your website, web application, or software project.",
  },
  "/book-a-meeting": {
    title: "Book a Meeting | Ziad Hossam",
    description: "Schedule a call with Ziad Hossam to discuss your next project.",
  },
  "/login": {
    title: "Client Login | Ziad Hossam",
    description: "Sign in to the Ziad Hossam client portal.",
    noindex: true,
  },
};

const DEFAULT_META = PAGE_META["/"];

export const PUBLIC_ROUTES = Object.keys(PAGE_META).filter((path) => !PAGE_META[path].noindex);

function resolveMeta(pathname: string): RouteMeta {
  if (pathname.startsWith("/portal") || pathname.startsWith("/admin") || pathname === "/404") {
    return { title: "Ziad Hossam", description: DEFAULT_META.description, noindex: true };
  }
  return PAGE_META[pathname] ?? DEFAULT_META;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Reads the real scheme behind a proxy (Render, etc.) without enabling Express's global `trust proxy`. */
function getRequestOrigin(req: Request): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : (forwardedProto ?? "").split(",");
  const isHttps = req.protocol === "https" || protoList.some((p) => p.trim().toLowerCase() === "https");
  return `${isHttps ? "https" : "http"}://${req.get("host")}`;
}

/** Rewrites the static index.html's placeholder SEO tags with the real per-route, per-request values. */
export function applySeoMeta(html: string, req: Request): string {
  // req.path is unreliable here: callers mount this behind `app.use("*", ...)`,
  // under which Express reports req.path relative to the wildcard match (always "/").
  const pathname = req.originalUrl.split("?")[0] || "/";
  const meta = resolveMeta(pathname);
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const origin = getRequestOrigin(req);
  const url = `${origin}${pathname === "/" ? "" : pathname}`;
  const image = `${origin}/images/og-image.jpg`;
  const robots = meta.noindex ? "noindex, nofollow" : "index, follow";

  return html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta name="robots" content=".*?" \/>/, `<meta name="robots" content="${robots}" />`)
    .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${description}" />`)
    .replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${image}" />`)
    .replace(/"url": "https:\/\/example\.com\/"/, `"url": "${origin}/"`);
}

export function buildRobotsTxt(req: Request): string {
  const origin = getRequestOrigin(req);
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /portal",
    "Disallow: /admin",
    "Disallow: /login",
    "Disallow: /api",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
}

export function buildSitemapXml(req: Request): string {
  const origin = getRequestOrigin(req);
  const urls = PUBLIC_ROUTES.map(
    (path) => `  <url><loc>${origin}${path === "/" ? "" : path}</loc></url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
