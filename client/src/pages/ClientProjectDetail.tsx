import { Fragment, FormEvent, useState } from "react";
import { useParams } from "wouter";
import { CheckCircle2, FileText, Loader2, MessageSquare, Send, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

function DeliverableRow({ deliverable, refetch }: { deliverable: any; refetch: () => void }) {
  const [reason, setReason] = useState("");
  const [showReason, setShowReason] = useState(false);
  const approve = trpc.portal.approveDeliverable.useMutation({ onSuccess: () => refetch() });
  const requestChanges = trpc.portal.requestDeliverableChanges.useMutation({ onSuccess: () => { setShowReason(false); setReason(""); refetch(); } });
  return <div>
    <div className="tracker-row">
      <div><strong>{deliverable.title}</strong><span className={`status-pill ${deliverable.status}`}>{deliverable.status.replace("_", " ")}</span></div>
      <div />
      {deliverable.status === "awaiting_approval" ? <div className="tracker-actions">
        <button className="outline-button" onClick={() => setShowReason(v => !v)}>REQUEST CHANGES</button>
        <button className="button button-accent" disabled={approve.isPending} onClick={() => approve.mutate({ id: deliverable.id })}>{approve.isPending ? <Loader2 className="spin" size={16} /> : <CheckCircle2 size={16} />} APPROVE</button>
      </div> : <div />}
      {deliverable.status === "changes_requested" && deliverable.reviewNote && <div className="tracker-note">You requested: {deliverable.reviewNote}</div>}
    </div>
    {showReason && <form className="inline-edit" onSubmit={(e: FormEvent) => { e.preventDefault(); if (reason.trim()) requestChanges.mutate({ id: deliverable.id, reason }); }}>
      <input className="form-input" placeholder="What needs to change?" value={reason} onChange={e => setReason(e.target.value)} />
      <button className="button button-accent" disabled={requestChanges.isPending}>{requestChanges.isPending ? <Loader2 className="spin" size={16} /> : "SUBMIT"}</button>
    </form>}
  </div>;
}

function AgreementPanel({ agreement, refetch }: { agreement: any; refetch: () => void }) {
  const [fullName, setFullName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const sign = trpc.portal.signAgreement.useMutation({ onSuccess: () => refetch() });
  if (!agreement) return <div className="empty-panel"><FileText size={24} /><p>No agreement has been drafted for this project yet.</p></div>;
  const fields = ["scope", "timeline", "cost", "revisions", "additionalWork", "cancellation", "ipOwnership", "terms"] as const;
  if (agreement.status === "draft") return <div className="empty-panel"><FileText size={24} /><p>Your agreement is being prepared. You'll be notified when it's ready to review.</p></div>;
  return <div className="agreement-doc">
    <p className={`status-pill ${agreement.status}`} style={{ display: "inline-block", marginBottom: "1rem" }}>{agreement.status}</p>
    <dl>{fields.map(f => <Fragment key={f}><dt>{f.replace(/([A-Z])/g, " $1")}</dt><dd>{agreement[f] || "—"}</dd></Fragment>)}</dl>
    {agreement.status === "signed" ? <p className="agreement-signed-badge" style={{ marginTop: "1.5rem" }}><ShieldCheck size={16} /> Signed by {agreement.signedName} on {new Date(agreement.signedAt).toLocaleString()}</p> : <div className="signature-box">
      <label className="signature-agree"><input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} /> I agree to the terms above</label>
      <label>FULL NAME<input className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Type your full legal name" /></label>
      <p className="section-kicker" style={{ marginTop: ".8rem" }}>SIGNATURE PREVIEW</p>
      <div className="signature-preview">{fullName || " "}</div>
      <button className="button button-accent" style={{ marginTop: "1.25rem" }} disabled={!agreed || fullName.trim().length < 2 || sign.isPending} onClick={() => sign.mutate({ id: agreement.id, fullName })}>{sign.isPending ? <Loader2 className="spin" size={16} /> : <ShieldCheck size={16} />} SIGN AGREEMENT</button>
    </div>}
  </div>;
}

export default function ClientProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const detail = trpc.portal.projectDetail.useQuery({ id: projectId });
  const [body, setBody] = useState("");
  const sendMessage = trpc.portal.sendMessage.useMutation({ onSuccess: () => { setBody(""); detail.refetch(); } });
  if (!detail.data) return <Shell><main className="system-page centered-state"><p>Loading project…</p></main></Shell>;
  const { project, milestones, deliverables, activity, attachments, agreement, messages } = detail.data;
  const refetch = () => detail.refetch();
  return <Shell>
    <div className="dashboard-heading compact"><div><p className="section-kicker">/ {project.status.replace("_", " ").toUpperCase()}</p><h1>{project.title.toUpperCase()}<span>.</span></h1></div></div>
    <div className="portal-stats"><div><span>PROGRESS</span><strong>{project.progress}%</strong></div><div><span>STARTED</span><strong>{project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}</strong></div><div><span>DEADLINE</span><strong>{project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}</strong></div><div><span>AGREEMENT</span><strong>{agreement?.status ?? "none"}</strong></div></div>
    <div className="dashboard-grid">
      <section className="dashboard-panel wide"><div className="panel-heading"><h2>MILESTONES</h2></div><div className="tracker-list">{milestones.length ? milestones.map((m: any) => <div className="project-progress" key={m.id}><div><strong>{m.title}</strong><span>{m.status.replace("_", " ")}</span></div><div className="progress-track"><i style={{ width: `${m.progress}%` }} /></div><b>{m.progress}%</b></div>) : <div className="empty-panel"><CheckCircle2 size={24} /><p>Milestones will appear here once your project starts.</p></div>}</div></section>
      <section className="dashboard-panel wide"><div className="panel-heading"><h2>DELIVERABLES</h2></div><div className="tracker-list">{deliverables.length ? deliverables.map((d: any) => <DeliverableRow deliverable={d} refetch={refetch} key={d.id} />) : <div className="empty-panel"><FileText size={24} /><p>Deliverables will appear here as work is completed.</p></div>}</div></section>
      <section className="dashboard-panel wide"><div className="panel-heading"><h2>AGREEMENT</h2></div><AgreementPanel agreement={agreement} refetch={refetch} /></section>
      <section className="dashboard-panel"><div className="panel-heading"><h2>ACTIVITY</h2></div>{activity.length ? activity.slice(0, 8).map((a: any) => <div className="activity-timeline" key={a.id}><b>{a.eventType.replace(/_/g, " ")}</b><span>{a.body} · {new Date(a.createdAt).toLocaleString()}</span></div>) : <div className="empty-panel"><FileText size={24} /><p>No activity yet.</p></div>}</section>
      <section className="dashboard-panel"><div className="panel-heading"><h2>FILES</h2></div><div className="file-status-list">{attachments.length ? attachments.map((a: any) => <div key={a.id}><a href={a.url} target="_blank" rel="noreferrer">{a.filename}</a><span>{new Date(a.createdAt).toLocaleDateString()}</span></div>) : <p style={{ color: "var(--muted-soft)", fontSize: ".78rem" }}>No files shared yet.</p>}</div></section>
      <section className="dashboard-panel wide"><div className="panel-heading"><h2>MESSAGE ZIAD</h2><MessageSquare size={18} /></div><div className="workspace-list">{messages.map((m: any) => <article key={m.id}><span>{new Date(m.createdAt).toLocaleString()}</span><p>{m.body}</p></article>)}{!messages.length && <div className="empty-panel"><MessageSquare size={24} /><p>Start the conversation below.</p></div>}</div><form className="inline-edit" style={{ marginTop: "1.25rem" }} onSubmit={(e: FormEvent) => { e.preventDefault(); if (body.trim()) sendMessage.mutate({ projectId, body }); }}><input className="form-input" placeholder="Send a message about this project…" value={body} onChange={e => setBody(e.target.value)} /><button className="button button-accent" disabled={sendMessage.isPending}>{sendMessage.isPending ? <Loader2 className="spin" size={16} /> : <Send size={16} />} SEND</button></form></section>
    </div>
  </Shell>;
}
