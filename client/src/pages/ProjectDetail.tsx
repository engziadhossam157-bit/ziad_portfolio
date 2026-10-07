import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Reveal } from "@/components/Motion";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import NotFound from "@/pages/NotFound";
import { PROJECTS, findProject, smallShot } from "@shared/portfolio";

export default function ProjectDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const project = findProject(slug);
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  // Native <dialog>: focus trapping, Escape-to-close, and the backdrop come for free.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active !== null && !dialog.open) dialog.showModal();
    if (active === null && dialog.open) dialog.close();
  }, [active]);

  if (!project) return <NotFound />;

  const index = PROJECTS.indexOf(project);
  const prev = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const [cover, ...gallery] = project.shots;
  const shots = project.shots;
  const step = (delta: number) => setActive((current) => current === null ? null : (current + delta + shots.length) % shots.length);

  const facts = [
    project.role && { label: "ROLE", value: project.role },
    { label: "TYPE", value: project.type },
    project.platform && { label: "PLATFORM", value: project.platform },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <main className="site-shell" id="top">
      <SiteHeader />

      <section className="case-hero section-grid">
        <Link href="/projects" className="back-link"><ArrowLeft size={15} /> ALL PROJECTS</Link>
        <p className="section-kicker">{project.category.toUpperCase()}</p>
        <h1>{project.title}<span>.</span></h1>
        <div className="case-intro">
          <div className="case-lead">{project.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <div className="case-side">
            <dl className="case-facts">{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
            {project.liveUrl && <a className="button button-accent" href={project.liveUrl} target="_blank" rel="noreferrer">VISIT LIVE SITE <ArrowUpRight size={17} /></a>}
          </div>
        </div>
      </section>

      {cover
        ? <Reveal className="case-cover section-grid">
            <button type="button" className="shot-button" onClick={() => setActive(0)} aria-label={`Enlarge: ${cover.caption}`}>
              <img src={cover.src} srcSet={`${smallShot(cover.src)} 800w, ${cover.src} 1600w`} sizes="(max-width: 850px) 100vw, 88vw" width={cover.width} height={cover.height} alt={cover.alt} fetchPriority="high" />
            </button>
          </Reveal>
        : <div className="case-cover section-grid"><div className="case-cover-word" aria-hidden="true">{project.title}</div></div>}

      <section className="case-body section-grid">
        <Reveal className="case-block">
          <h2>What I built</h2>
          <ul className="areas-list">{project.areas.map((area) => <li key={area}>{area}</li>)}</ul>
        </Reveal>
        <Reveal delay={100} className="case-block">
          <h2>Tech stack</h2>
          <ul className="tag-list is-large">{project.technologies.map((tech) => <li key={tech}>{tech}</li>)}</ul>
        </Reveal>
      </section>

      {gallery.length > 0 && <section className="case-gallery section-grid" aria-label="Screenshots">
        <h2>Screens</h2>
        <div className="gallery-grid">
          {gallery.map((shot, i) => (
            <Reveal key={shot.src} delay={(i % 3) * 60}>
              <figure>
                <button type="button" className="shot-button" onClick={() => setActive(i + 1)} aria-label={`Enlarge: ${shot.caption}`}>
                  <img src={smallShot(shot.src)} className={shot.height / shot.width > 0.7 ? "is-tall" : undefined} width={800} height={Math.round(shot.height / 2)} alt={shot.alt} loading="lazy" decoding="async" />
                </button>
                <figcaption>{shot.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>}

      <nav className="case-pager section-grid" aria-label="More projects">
        <Link href={`/projects/${prev.slug}`}><span><ArrowLeft size={15} /> PREVIOUS</span><strong>{prev.title}</strong></Link>
        <Link href={`/projects/${next.slug}`} className="is-next"><span>NEXT <ArrowRight size={15} /></span><strong>{next.title}</strong></Link>
      </nav>

      <section className="cta-section section-grid" id="contact">
        <Reveal className="cta-copy"><h2>WANT SOMETHING<br /><span>LIKE THIS?</span></h2><Link href="/start-project" className="button button-accent">START A PROJECT <ArrowUpRight size={18} /></Link></Reveal>
        <Reveal delay={120} className="cta-aside"><p>Tell me what you're building and I'll reply with the next step.</p><div className="social-links"><Link href="/book-a-meeting">BOOK A MEETING</Link><Link href="/projects">ALL PROJECTS</Link></div></Reveal>
      </section>
      <SiteFooter />

      <dialog ref={dialogRef} className="lightbox" onClose={() => setActive(null)} onClick={(e) => { if (e.target === e.currentTarget) setActive(null); }} onKeyDown={(e) => { if (e.key === "ArrowLeft") step(-1); if (e.key === "ArrowRight") step(1); }} aria-label="Screenshot viewer">
        {active !== null && <figure>
          <img src={shots[active].src} width={shots[active].width} height={shots[active].height} alt={shots[active].alt} />
          <figcaption><span>{shots[active].caption}</span><span>{active + 1} / {shots.length}</span></figcaption>
        </figure>}
        <button type="button" className="lightbox-close" onClick={() => setActive(null)} aria-label="Close"><X size={20} /></button>
        {shots.length > 1 && <>
          <button type="button" className="lightbox-nav is-prev" onClick={() => step(-1)} aria-label="Previous screenshot"><ChevronLeft size={24} /></button>
          <button type="button" className="lightbox-nav is-next" onClick={() => step(1)} aria-label="Next screenshot"><ChevronRight size={24} /></button>
        </>}
      </dialog>
    </main>
  );
}
