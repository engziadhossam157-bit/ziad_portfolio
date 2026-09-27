import { Blocks, Brain, Code2, Figma, Globe, Layers3, Monitor, Rocket, Server, ShoppingBag, Smartphone, Sparkles, Workflow, Wrench, type LucideIcon } from "lucide-react";

// Fallbacks for when the admin "About / Profile" record leaves a field empty.
export const CONTACT_EMAIL = "eng.ziadhossam157@gmail.com";
export const GITHUB_URL = "https://github.com/engziadhossam157-bit";
export const LOCATION = "Cairo, Egypt";

export type Capability = { icon: LucideIcon; title: string; desc: string; flagship?: boolean };

// What Ziad works on, shown as the About page capability cards. The hireable services list
// (home + /services) lives in shared/portfolio.ts next to the projects it links to.
export const CAPABILITIES: Capability[] = [
  { icon: Brain, title: "AI Engineering", desc: "Studying how to design and build intelligent systems, from LLM-driven features to applied machine learning.", flagship: true },
  { icon: Globe, title: "Full-Stack Web Development", desc: "Complete products end to end: the front end, the back end, and everything that connects them." },
  { icon: Server, title: "Backend & API Development", desc: "Typed, reliable services and APIs that hold up under real usage." },
  { icon: Workflow, title: "Automation & Intelligent Systems", desc: "Workflows and tools that remove repetitive work and let systems make good decisions on their own." },
  { icon: Blocks, title: "Software Architecture", desc: "Structuring software so it stays easy to change as the product and the team grow." },
];

// Icon names an admin can set on a service record.
const SERVICE_ICONS: Record<string, LucideIcon> = { code2: Code2, figma: Figma, layers3: Layers3, sparkles: Sparkles, wrench: Wrench, rocket: Rocket, globe: Globe, smartphone: Smartphone, brain: Brain, server: Server, workflow: Workflow, blocks: Blocks, shoppingbag: ShoppingBag, monitor: Monitor };
export function resolveServiceIcon(name?: string | null): LucideIcon { return SERVICE_ICONS[(name ?? "").toLowerCase()] ?? Sparkles; }

export const MARQUEE_ITEMS = ["FULL-STACK WEB APPS", "E-COMMERCE STORES", "BUSINESS WEBSITES", "DESKTOP APPS", "AI ENGINEERING"];

export type SocialLink = { label: string; href: string };

/**
 * Parses the admin "Label: URL" lines (one per line). Falls back to GitHub so the
 * contact block never renders a placeholder link.
 */
export function parseSocialLinks(raw?: string | null): SocialLink[] {
  const links = (raw ?? "")
    .split("\n")
    .map((line) => line.match(/^\s*([^:]+?)\s*:\s*(https?:\/\/\S+)\s*$/i))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map(([, label, href]) => ({ label: label.toUpperCase(), href }));
  return links.length ? links : [{ label: "GITHUB", href: GITHUB_URL }];
}
