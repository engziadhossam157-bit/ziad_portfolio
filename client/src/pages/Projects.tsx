import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Reveal } from "@/components/Motion";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ProjectCard, toCardData, type ProjectCardData } from "@/components/ProjectCard";
import { PROJECTS } from "@shared/portfolio";

const ALL = "ALL";

export default function Projects() {
  const [filter, setFilter] = useState(ALL);
  const adminProjects = trpc.portfolio.allProjects.useQuery();

  // Case studies come from shared/portfolio.ts. Public projects added in the admin workspace are
  // listed after them (linking out to their live or GitHub URL) unless they duplicate a case study.
  const cards = useMemo(() => {
    const known = new Set(PROJECTS.map((project) => project.title.toLowerCase()));
    const caseStudies = PROJECTS.map((project) => toCardData(project, 4));
    const extras: ProjectCardData[] = (adminProjects.data ?? [])
      .filter((project) => !known.has(project.title.toLowerCase()))
      .map((project) => ({
        title: project.title, category: project.category, summary: project.description, year: project.year,
        href: project.liveUrl || project.githubUrl || undefined, external: true,
        shot: project.imageUrl ? { src: project.imageUrl, width: 1600, height: 1000, alt: `${project.title} preview`, caption: project.title } : undefined,
        tags: project.technologies?.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 4),
      }));
    return [...caseStudies, ...extras];
  }, [adminProjects.data]);

  const categories = useMemo(() => [ALL, ...Array.from(new Set(cards.map((card) => card.category)))], [cards]);
  const visible = filter === ALL ? cards : cards.filter((card) => card.category === filter);

  return (
    <main className="site-shell" id="top">
      <SiteHeader />
      <section className="projects-page section-grid">
        <p className="section-kicker">SELECTED WORK</p>
        <h1>PROJECTS<span>.</span></h1>
        <p className="public-lead">Web applications, an ERP system, online stores, business websites, and a desktop app. Open a project to see what I built and the stack behind it.</p>
        <div className="filter-row" role="group" aria-label="Filter projects by category">
          {categories.map((category) => <button key={category} type="button" className={filter === category ? "active" : ""} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category === ALL ? "ALL" : category.toUpperCase()}</button>)}
        </div>
        <div className="project-grid is-even">
          {visible.map((card, index) => <Reveal key={card.title} delay={(index % 2) * 80}><ProjectCard project={card} tone={index % 2 ? "soft" : "navy"} /></Reveal>)}
        </div>
      </section>

      <section className="cta-section section-grid" id="contact">
        <Reveal className="cta-copy"><h2>HAVE A PROJECT<br /><span>IN MIND?</span></h2><Link href="/start-project" className="button button-accent">START A PROJECT <ArrowUpRight size={18} /></Link></Reveal>
        <Reveal delay={120} className="cta-aside"><p>Tell me what you're building and I'll reply with the next step.</p><div className="social-links"><Link href="/book-a-meeting">BOOK A MEETING</Link><Link href="/services">SERVICES</Link></div></Reveal>
      </section>
      <SiteFooter />
    </main>
  );
}
