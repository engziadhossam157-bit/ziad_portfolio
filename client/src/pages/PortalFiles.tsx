import { Link } from "wouter";
import { ArrowUpRight, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

export default function PortalFiles() {
  const dashboard = trpc.portal.dashboard.useQuery();
  const projects = dashboard.data?.projects ?? [];
  return <Shell>
    <div className="dashboard-heading"><div><p className="section-kicker">/ FILES</p><h1>SHARED<br /><span>FILES.</span></h1></div></div>
    <section className="dashboard-panel wide request-table">
      <div className="panel-heading"><h2>PROJECT FILES</h2></div>
      {projects.length ? projects.map((project) => <Link href={`/portal/projects/${project.id}`} className="request-row" key={project.id}>
        <div><strong>{project.title}</strong><span>Files shared for this project</span></div>
        <span className="status-pill">VIEW FILES</span>
        <ArrowUpRight size={16} />
      </Link>) : <div className="empty-panel"><FileText size={24} /><p>Your files will appear here once a project is set up.</p></div>}
    </section>
  </Shell>;
}
