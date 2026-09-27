import { Link } from "wouter";
import { Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

export default function AdminClients() {
  const clients = trpc.admin.clients.list.useQuery();
  return <Shell admin><div className="admin-page-wrap">
    <div className="dashboard-heading compact">
      <div><p className="section-kicker">/ CLIENT MANAGEMENT</p><h1>YOUR<br /><span>CLIENTS.</span></h1></div>
    </div>
    <section className="dashboard-panel request-table">
      <div className="panel-heading"><h2>ALL CLIENTS</h2><span className="section-kicker">{clients.data?.length ?? 0} ITEMS</span></div>
      {clients.data?.map(client => <div className="request-row" key={client.id}>
        <Link href={`/admin/clients/${client.id}`}>
          <strong>{client.name || client.email}</strong>
          <span>{client.email}{client.company ? ` · ${client.company}` : ""}</span>
        </Link>
        <span className={`status-pill ${client.status}`}>{client.status}</span>
      </div>)}
      {clients.data?.length === 0 && <div className="empty-panel"><Users size={24} /><p>No clients yet. Clients are created automatically when a project request is accepted.</p></div>}
    </section>
  </div></Shell>;
}
