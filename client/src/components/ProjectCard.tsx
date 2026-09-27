import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { Tilt3D } from "@/components/Motion";
import { smallShot, type PortfolioProject, type ProjectShot } from "@shared/portfolio";

export type ProjectCardData = {
  title: string;
  category: string;
  summary: string;
  /** Internal case-study route, or an external URL for admin-created projects. */
  href?: string;
  external?: boolean;
  year?: number;
  shot?: ProjectShot;
  tint?: "navy" | "sand";
  tags?: string[];
};

/** Card data for a case study from shared/portfolio.ts; the card links to its detail page. */
export const toCardData = (project: PortfolioProject, tagCount = 3): ProjectCardData => ({
  title: project.title, category: project.category, summary: project.summary,
  href: `/projects/${project.slug}`, shot: project.shots[0], tint: project.tint, tags: project.technologies.slice(0, tagCount),
});

/** One work tile: a screenshot peeking up from a tinted panel, or a typographic cover when there is no image. */
export function ProjectCard({ project, tone = "navy" }: { project: ProjectCardData; tone?: "navy" | "soft" }) {
  const { title, category, summary, href, external, year, shot, tint = "navy", tags } = project;

  const cover = (
    <Tilt3D className={`project-visual${shot ? ` has-image tint-${tint}` : ""}`} intensity={6}>
      {shot
        ? <img src={shot.src} srcSet={smallShot(shot.src) !== shot.src ? `${smallShot(shot.src)} 800w, ${shot.src} 1600w` : undefined} sizes="(max-width: 850px) 92vw, 45vw" width={shot.width} height={shot.height} alt={shot.alt} loading="lazy" decoding="async" />
        : <div className="project-visual-word" aria-hidden="true">{title.split(" ")[0]}</div>}
      {year && <span className="project-year">{year}</span>}
    </Tilt3D>
  );

  const body = (
    <>
      {cover}
      <div className="project-meta">
        <div>
          <h3>{title}{href && <ArrowUpRight size={18} className="project-arrow" aria-hidden="true" />}</h3>
          <p>{summary}</p>
          {tags && tags.length > 0 && <ul className="tag-list" aria-label="Technologies">{tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
        </div>
        <span>{category}</span>
      </div>
    </>
  );

  return (
    <article className={`project-card tone-${tone}`}>
      {href
        ? external
          ? <a className="project-link" href={href} target="_blank" rel="noreferrer">{body}</a>
          : <Link className="project-link" href={href}>{body}</Link>
        : body}
    </article>
  );
}
