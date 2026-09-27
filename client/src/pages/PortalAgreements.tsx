import { Link } from "wouter";
import { ArrowUpRight, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

export default function PortalAgreements() {
  const dashboard = trpc.portal.dashboard.useQuery();
  const projects = dashboard.data?.projects ?? [];
  return <Shell>
    <div className="dashboard-heading"><div><p className="section-kicker">/ AGREEMENT</p><h1>YOUR<br /><span>AGREEMENTS.</span></h1></div></div>
    <section className="dashboard-panel wide request-table">
      <div className="panel-heading"><h2>PROJECT AGREEMENTS</h2></div>
      {projects.length ? projects.map((project) => <Link href={`/portal/projects/${project.id}`} className="request-row" key={project.id}>
        <div><strong>{project.title}</strong><span>View &amp; sign your agreement</span></div>
        <ArrowUpRight size={16} />
      </Link>) : <div className="empty-panel"><FileText size={24} /><p>Your agreement will appear here once a project is set up.</p></div>}
    </section>
  </Shell>;
}
