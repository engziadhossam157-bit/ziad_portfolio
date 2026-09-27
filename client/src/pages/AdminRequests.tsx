import { CheckCircle2, Inbox, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

type RequestStatus = "new" | "reviewing" | "accepted" | "declined" | "converted";

export default function AdminRequests() {
  const [, navigate] = useLocation();
  const requests = trpc.requests.adminList.useQuery();
  const setStatus = trpc.requests.setStatus.useMutation({ onSuccess: () => requests.refetch() });
  const accept = trpc.requests.accept.useMutation();

  const acceptRequest = async (id: number) => {
    const result = await accept.mutateAsync({ id });
    requests.refetch();
    navigate(`/admin/projects/${result.projectId}`);
  };

  return <Shell admin><div className="admin-page-wrap">
    <div className="dashboard-heading compact">
      <div><p className="section-kicker">/ CLIENT MANAGEMENT</p><h1>PROJECT<br /><span>REQUESTS.</span></h1></div>
    </div>
    <section className="dashboard-panel request-table">
      <div className="panel-heading"><h2>ALL REQUESTS</h2><span className="section-kicker">{requests.data?.length ?? 0} ITEMS</span></div>
      {requests.data?.map(request => <div className="request-row" key={request.id}>
        <div>
          <strong>{request.projectName}</strong>
          <span>{request.name} · {request.projectType} · {request.description.slice(0, 90)}{request.description.length > 90 ? "…" : ""}</span>
          <span>{request.budget ? `Budget: ${request.budget}` : ""}{request.deadline ? ` · Due ${new Date(request.deadline).toLocaleDateString()}` : ""}{request.referenceUrls ? ` · Refs: ${request.referenceUrls}` : ""}</span>
        </div>
        <div className="inline-edit">
          <span className={`status-pill ${request.status}`}>{request.status}</span>
          <select className="status-select" value={request.status} onChange={e => setStatus.mutate({ id: request.id, status: e.target.value as RequestStatus })}>
            <option value="new">new</option>
            <option value="reviewing">reviewing</option>
            <option value="declined">declined</option>
            <option value="converted">converted</option>
            <option value="accepted">accepted</option>
          </select>
          {request.status !== "accepted" && <button className="button button-accent" disabled={accept.isPending} onClick={() => acceptRequest(request.id)}>{accept.isPending ? <Loader2 className="spin" size={15} /> : <CheckCircle2 size={15} />} ACCEPT</button>}
        </div>
      </div>)}
      {requests.data?.length === 0 && <div className="empty-panel"><Inbox size={24} /><p>No project requests yet.</p></div>}
    </section>
  </div></Shell>;
}
