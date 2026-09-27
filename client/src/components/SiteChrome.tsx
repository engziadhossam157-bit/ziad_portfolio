import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUp, ArrowUpRight, Menu, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth, portalLink } from "@/_core/hooks/useAuth";
import { useMagnetic } from "@/hooks/useMagnetic";
import { LOCATION } from "@/lib/site";

/** Public-site header shared by every marketing page, so nav, CTA, and mobile menu never drift apart. */
export function SiteHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const ctaRef = useMagnetic<HTMLAnchorElement>(.35);

  const onHome = location === "/";
  const portal = portalLink(user);

  useEffect(() => { setMenuOpen(false); }, [location]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Home sections are in-page anchors on "/", and route back to "/" from anywhere else.
  const section = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  const close = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label="Ziad Hossam, home">ZIAD<span>.</span></Link>
      <nav id="site-nav" className={`public-nav ${menuOpen ? "open" : ""}`} aria-label="Main">
        <Link href="/about" onClick={close} aria-current={location === "/about" ? "page" : undefined}>ABOUT</Link>
        <Link href="/projects" onClick={close} aria-current={location.startsWith("/projects") ? "page" : undefined}>PROJECTS</Link>
        <a href={section("services")} onClick={close}>SERVICES</a>
        <a href={section("contact")} onClick={close}>CONTACT</a>
        <Link href={portal.href} className="nav-portal" onClick={close}>{portal.label} <ArrowUpRight size={15} /></Link>
        <Link href="/book-a-meeting" className="nav-mobile-cta" onClick={close}>BOOK A MEETING <ArrowUpRight size={15} /></Link>
      </nav>
      <div className="header-actions">
        <Link href="/book-a-meeting" className="header-cta" ref={ctaRef}>BOOK A MEETING <ArrowUpRight size={16} /></Link>
        <button type="button" className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="site-nav" aria-label={menuOpen ? "Close menu" : "Open menu"}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const about = trpc.portfolio.about.useQuery();
  const name = (about.data?.name || "Ziad Hossam").toUpperCase();
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} {name}</span>
      <span>{(about.data?.location || LOCATION).toUpperCase()}</span>
      <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }}>BACK TO TOP <ArrowUp size={14} /></a>
    </footer>
  );
}

/** Scrolls to the URL hash after the page mounts, so "/#services" links from other pages land on the section. */
export function useHashScroll(ready: boolean) {
  useEffect(() => {
    if (!ready || !window.location.hash) return;
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  }, [ready]);
}
