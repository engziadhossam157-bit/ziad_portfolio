import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Inbox, Loader2, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

type RequestStatus = "new" | "reviewing" | "accepted" | "declined" | "converted";

export default function AdminRequests() {
  const [approved, setApproved] = useState<{ name: string; email: string; phone: string; projectName: string; projectId: number } | null>(null);
  const requests = trpc.requests.adminList.useQuery();
  const setStatus = trpc.requests.setStatus.useMutation({ onSuccess: () => requests.refetch() });
  const accept = trpc.requests.accept.useMutation();

  // Accepting creates the client's account from the request's email and phone; that pair is their sign-in.
  type Request = NonNullable<typeof requests.data>[number];
  const acceptRequest = async (request: Request) => {
    if (!request.phone) return window.alert("This request has no phone number, so the client could not sign in. Add a phone in the client's profile first.");
    if (!window.confirm(`Approve “${request.projectName}”? This creates ${request.name}'s client portal. They sign in with ${request.email} and ${request.phone}.`)) return;
    const result = await accept.mutateAsync({ id: request.id });
    requests.refetch();
    setApproved({ name: request.name, email: request.email, phone: request.phone, projectName: request.projectName, projectId: result.projectId });
  };
  const signInMessage = (a: NonNullable<typeof approved>) =>
    `Hi ${a.name}, your project “${a.projectName}” is approved. Follow it in your client portal: ${window.location.origin}/login
Sign in with your email (${a.email}) and this phone number.`;

  return <Shell admin><div className="admin-page-wrap">
    <div className="dashboard-heading compact">
      <div><p className="section-kicker">/ CLIENT MANAGEMENT</p><h1>PROJECT<br /><span>REQUESTS.</span></h1></div>
    </div>
    {approved && <section className="dashboard-panel approved-panel" role="status">
      <div className="panel-heading"><h2>CLIENT PORTAL OPENED</h2><button className="icon-button" onClick={() => setApproved(null)} aria-label="Dismiss">×</button></div>
      <p><strong>{approved.name}</strong> can now sign in at <strong>{window.location.origin}/login</strong> with:</p>
      <p>Email: <strong>{approved.email}</strong> · Phone: <strong>{approved.phone}</strong></p>
      <div className="hero-actions">
        <a className="button button-accent" href={`https://wa.me/${approved.phone.replace(/\D/g, "").replace(/^0/, "20")}?text=${encodeURIComponent(signInMessage(approved))}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /> SEND ON WHATSAPP</a>
        <Link className="button button-outline" href={`/admin/projects/${approved.projectId}`}>OPEN PROJECT <ArrowUpRight size={15} /></Link>
      </div>
    </section>}
    <section className="dashboard-panel request-table">
      <div className="panel-heading"><h2>ALL REQUESTS</h2><span className="section-kicker">{requests.data?.length ?? 0} ITEMS</span></div>
      {requests.data?.map(request => <div className="request-row" key={request.id}>
        <div>
          <strong>{request.projectName}</strong>
          <span>{request.name} · {request.email}{request.phone ? ` · ${request.phone}` : " · no phone"}</span>
          <span>{request.projectType} · {request.description.slice(0, 90)}{request.description.length > 90 ? "…" : ""}</span>
          <span>{request.budget ? `Budget: ${request.budget}` : ""}{request.deadline ? ` · Due ${new Date(request.deadline).toLocaleDateString()}` : ""}{request.referenceUrls ? ` · Refs: ${request.referenceUrls}` : ""}</span>
        </div>
        <div className="inline-edit">
          <span className={`status-pill ${request.status}`}>{request.status}</span>
          <select className="status-select" value={request.status} onChange={e => setStatus.mutate({ id: request.id, status: e.target.value as RequestStatus })}>
            <option value="new">new</option>
            <option value="reviewing">reviewing</option>
            <option value="declined">declined</option>
            <option value="converted">converted</option>
            {request.status === "accepted" && <option value="accepted">accepted</option>}
          </select>
          {request.status !== "accepted" && <button className="button button-accent" disabled={accept.isPending} onClick={() => acceptRequest(request)}>{accept.isPending ? <Loader2 className="spin" size={15} /> : <CheckCircle2 size={15} />} APPROVE</button>}
        </div>
      </div>)}
      {requests.data?.length === 0 && <div className="empty-panel"><Inbox size={24} /><p>No project requests yet.</p></div>}
    </section>
  </div></Shell>;
}
