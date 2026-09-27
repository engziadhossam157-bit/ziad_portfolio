import { ArrowUpRight } from "lucide-react";
import { Tilt3D } from "@/components/Motion";

type PublicProject = {
  id: number;
  title: string;
  description: string;
  category: string;
  year: number;
  imageUrl?: string | null;
  liveUrl?: string | null;
  githubUrl?: string | null;
};

/** One work tile. Uses the project's cover image when set, otherwise a typographic cover. */
export function ProjectCard({ project, tone = "navy" }: { project: PublicProject; tone?: "navy" | "soft" }) {
  const link = project.liveUrl
    ? { href: project.liveUrl, label: "VISIT LIVE SITE" }
    : project.githubUrl
      ? { href: project.githubUrl, label: "VIEW ON GITHUB" }
      : null;

  return (
    <article className={`project-card tone-${tone}`}>
      <Tilt3D className={`project-visual${project.imageUrl ? " has-image" : ""}`}>
        {project.imageUrl
          ? <img src={project.imageUrl} alt={`${project.title} preview`} loading="lazy" decoding="async" />
          : <div className="project-visual-word" aria-hidden="true">{project.title.split(" ")[0]}</div>}
        <span className="project-year">{project.year}</span>
        {link && <a className="project-hover" href={link.href} target="_blank" rel="noreferrer"><span>{link.label}</span><ArrowUpRight size={16} /></a>}
      </Tilt3D>
      <div className="project-meta">
        <div><h3>{project.title}</h3><p>{project.description}</p></div>
        <span>{project.category}</span>
      </div>
    </article>
  );
}
