import { Link } from "wouter";
import { FolderKanban } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

export default function PortalProjects() {
  const dashboard = trpc.portal.dashboard.useQuery();
  const data = dashboard.data;
  return <Shell>
    <div className="dashboard-heading"><div><p className="section-kicker">/ MY PROJECTS</p><h1>ACTIVE<br /><span>PROJECTS.</span></h1></div></div>
    <div className="dashboard-grid">
      <section className="dashboard-panel wide">
        <div className="panel-heading"><h2>ALL PROJECTS</h2></div>
        {data?.projects.length ? data.projects.map((project) => <Link href={`/portal/projects/${project.id}`} className="project-progress" key={project.id}>
          <div><strong>{project.title}</strong><span>{project.status.replace("_", " ")}</span></div>
          <div className="progress-track"><i style={{ width: `${project.progress}%` }} /></div>
          <b>{project.progress}%</b>
        </Link>) : <div className="empty-panel"><FolderKanban size={24} /><p>Your active projects will appear here once a request is accepted.</p></div>}
      </section>
    </div>
  </Shell>;
}
