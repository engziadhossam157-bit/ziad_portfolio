import { MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

type ChangeRequestStatus = "open" | "in_progress" | "resolved" | "closed";

export default function AdminChangeRequests() {
  const changeRequests = trpc.admin.changeRequests.all.useQuery();
  const updateStatus = trpc.admin.changeRequests.updateStatus.useMutation({ onSuccess: () => changeRequests.refetch() });

  return <Shell admin><div className="admin-page-wrap">
    <div className="dashboard-heading compact">
      <div><p className="section-kicker">/ CLIENT MANAGEMENT</p><h1>CLIENT<br /><span>REQUESTS.</span></h1></div>
    </div>
    <section className="dashboard-panel request-table">
      <div className="panel-heading"><h2>ALL CHANGE REQUESTS</h2><span className="section-kicker">{changeRequests.data?.length ?? 0} ITEMS</span></div>
      {changeRequests.data?.map(cr => <div className="request-row" key={cr.id}>
        <div>
          <strong>{cr.title}</strong>
          <span>{cr.type.replace("_", " ")} · {cr.priority} priority</span>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: ".78rem", lineHeight: 1.5 }}>{cr.description}</p>
        </div>
        <div className="inline-edit">
          <span className={`status-pill ${cr.status}`}>{cr.status.replace("_", " ")}</span>
          {cr.priority === "urgent" && <span className="status-pill urgent">URGENT</span>}
        </div>
        <select className="status-select" value={cr.status} onChange={e => updateStatus.mutate({ id: cr.id, status: e.target.value as ChangeRequestStatus })}>
          <option value="open">open</option>
          <option value="in_progress">in progress</option>
          <option value="resolved">resolved</option>
          <option value="closed">closed</option>
        </select>
      </div>)}
      {changeRequests.data?.length === 0 && <div className="empty-panel"><MessageSquare size={24} /><p>No client change requests yet.</p></div>}
    </section>
  </div></Shell>;
}
