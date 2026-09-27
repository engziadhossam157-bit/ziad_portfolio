import { Fragment, FormEvent, useState } from "react";
import { useParams } from "wouter";
import { CheckCircle2, FileText, Loader2, Plus, Send, Trash2, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

type Tab = "overview" | "milestones" | "deliverables" | "agreement" | "files" | "messages";

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
}

function MilestonesTab({ projectId, milestones, refetch }: { projectId: number; milestones: any[]; refetch: () => void }) {
  const [title, setTitle] = useState("");
  const create = trpc.admin.milestones.create.useMutation({ onSuccess: () => { setTitle(""); refetch(); } });
  const update = trpc.admin.milestones.update.useMutation({ onSuccess: () => refetch() });
  const remove = trpc.admin.milestones.delete.useMutation({ onSuccess: () => refetch() });
  return <section className="dashboard-panel wide">
    <div className="panel-heading"><h2>MILESTONES</h2><span className="section-kicker">{milestones.length} ITEMS</span></div>
    <div className="tracker-list">
      {milestones.map(m => <div className="tracker-row" key={m.id}>
        <div><strong>{m.title}</strong><span className={`status-pill ${m.status}`}>{m.status.replace("_", " ")}</span></div>
        <div className="progress-track"><i style={{ width: `${m.progress}%` }} /></div>
        <div className="tracker-actions">
          <input className="progress-input" type="number" min="0" max="100" value={m.progress} onChange={e => update.mutate({ id: m.id, projectId, progress: Number(e.target.value) })} />
          <select className="status-select" value={m.status} onChange={e => update.mutate({ id: m.id, projectId, status: e.target.value as any })}><option value="pending">pending</option><option value="in_progress">in progress</option><option value="completed">completed</option></select>
          <button className="icon-button" onClick={() => remove.mutate({ id: m.id })} aria-label={`Delete ${m.title}`}><Trash2 size={15} /></button>
        </div>
      </div>)}
      {!milestones.length && <div className="empty-panel"><CheckCircle2 size={24} /><p>No milestones yet. Add the first one below.</p></div>}
    </div>
    <form className="inline-edit" style={{ marginTop: "1.25rem" }} onSubmit={(e: FormEvent) => { e.preventDefault(); if (title.trim()) create.mutate({ projectId, title, sortOrder: milestones.length }); }}>
      <input className="form-input" placeholder="New milestone title" value={title} onChange={e => setTitle(e.target.value)} />
      <button className="button button-accent" disabled={create.isPending}>{create.isPending ? <Loader2 className="spin" size={16} /> : <Plus size={16} />} ADD</button>
    </form>
  </section>;
}

function DeliverablesTab({ projectId, milestones, deliverables, refetch }: { projectId: number; milestones: any[]; deliverables: any[]; refetch: () => void }) {
  const [title, setTitle] = useState("");
  const [milestoneId, setMilestoneId] = useState<number | "">("");
  const create = trpc.admin.deliverables.create.useMutation({ onSuccess: () => { setTitle(""); refetch(); } });
  const update = trpc.admin.deliverables.update.useMutation({ onSuccess: () => refetch() });
  const remove = trpc.admin.deliverables.delete.useMutation({ onSuccess: () => refetch() });
  return <section className="dashboard-panel wide">
    <div className="panel-heading"><h2>DELIVERABLES</h2><span className="section-kicker">{deliverables.length} ITEMS</span></div>
    <div className="tracker-list">
      {deliverables.map(d => <div className="tracker-row" key={d.id}>
        <div><strong>{d.title}</strong><span>{milestones.find(m => m.id === d.milestoneId)?.title ?? "No milestone"}</span></div>
        <span className={`status-pill ${d.status}`}>{d.status.replace("_", " ")}</span>
        <div className="tracker-actions">
          <select className="status-select" value={d.status} onChange={e => update.mutate({ id: d.id, projectId, status: e.target.value as any })}><option value="pending">pending</option><option value="in_progress">in progress</option><option value="awaiting_approval">awaiting approval</option><option value="changes_requested">changes requested</option><option value="completed">completed</option></select>
          <button className="icon-button" onClick={() => remove.mutate({ id: d.id })} aria-label={`Delete ${d.title}`}><Trash2 size={15} /></button>
        </div>
        {d.status === "changes_requested" && d.reviewNote && <div className="tracker-note">Client requested changes: {d.reviewNote}</div>}
      </div>)}
      {!deliverables.length && <div className="empty-panel"><FileText size={24} /><p>No deliverables yet.</p></div>}
    </div>
    <form className="inline-edit" style={{ marginTop: "1.25rem" }} onSubmit={(e: FormEvent) => { e.preventDefault(); if (title.trim()) create.mutate({ projectId, title, milestoneId: milestoneId || undefined, sortOrder: deliverables.length }); }}>
      <input className="form-input" placeholder="New deliverable title" value={title} onChange={e => setTitle(e.target.value)} />
      <select className="form-input" value={milestoneId} onChange={e => setMilestoneId(e.target.value ? Number(e.target.value) : "")}><option value="">No milestone</option>{milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}</select>
      <button className="button button-accent" disabled={create.isPending}>{create.isPending ? <Loader2 className="spin" size={16} /> : <Plus size={16} />} ADD</button>
    </form>
  </section>;
}

function AgreementTab({ projectId, clientId, agreement, refetch }: { projectId: number; clientId: number | null; agreement: any; refetch: () => void }) {
  const create = trpc.admin.agreements.create.useMutation({ onSuccess: () => refetch() });
  const update = trpc.admin.agreements.update.useMutation({ onSuccess: () => refetch() });
  const send = trpc.admin.agreements.send.useMutation({ onSuccess: () => refetch() });
  const [form, setForm] = useState({ scope: agreement?.scope ?? "", timeline: agreement?.timeline ?? "", cost: agreement?.cost ?? "", revisions: agreement?.revisions ?? "", additionalWork: agreement?.additionalWork ?? "", cancellation: agreement?.cancellation ?? "", ipOwnership: agreement?.ipOwnership ?? "", terms: agreement?.terms ?? "" });
  if (!agreement) return <section className="dashboard-panel wide"><div className="panel-heading"><h2>AGREEMENT</h2></div><div className="empty-panel"><FileText size={24} /><p>No agreement drafted for this project yet.</p><button className="button button-accent" disabled={!clientId || create.isPending} onClick={() => clientId && create.mutate({ projectId, clientId })}>{create.isPending ? <Loader2 className="spin" size={16} /> : <Plus size={16} />} DRAFT AGREEMENT</button></div></section>;
  return <section className="dashboard-panel wide">
    <div className="panel-heading"><h2>AGREEMENT</h2><span className={`status-pill ${agreement.status}`}>{agreement.status}</span></div>
    {agreement.status === "signed" ? <div className="agreement-doc"><p className="agreement-signed-badge"><CheckCircle2 size={16} /> Signed by {agreement.signedName} on {new Date(agreement.signedAt).toLocaleString()}</p><dl>{(["scope", "timeline", "cost", "revisions", "additionalWork", "cancellation", "ipOwnership", "terms"] as const).map(f => <Fragment key={f}>
      <dt>{f.replace(/([A-Z])/g, " $1")}</dt><dd>{agreement[f] || "—"}</dd>
    </Fragment>)}</dl></div> : <>
      <div className="form-grid">
        <label>SCOPE<textarea className="form-input form-textarea" value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} /></label>
        <label>TIMELINE<textarea className="form-input form-textarea" value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })} /></label>
        <label>COST<textarea className="form-input form-textarea" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} /></label>
        <label>REVISIONS<textarea className="form-input form-textarea" value={form.revisions} onChange={e => setForm({ ...form, revisions: e.target.value })} /></label>
        <label>ADDITIONAL WORK<textarea className="form-input form-textarea" value={form.additionalWork} onChange={e => setForm({ ...form, additionalWork: e.target.value })} /></label>
        <label>CANCELLATION<textarea className="form-input form-textarea" value={form.cancellation} onChange={e => setForm({ ...form, cancellation: e.target.value })} /></label>
        <label>IP / OWNERSHIP<textarea className="form-input form-textarea" value={form.ipOwnership} onChange={e => setForm({ ...form, ipOwnership: e.target.value })} /></label>
        <label>TERMS<textarea className="form-input form-textarea" value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} /></label>
      </div>
      <div className="tracker-actions" style={{ justifyContent: "flex-start", marginTop: "1rem" }}>
        <button className="outline-button" disabled={update.isPending} onClick={() => update.mutate({ id: agreement.id, ...form })}>{update.isPending ? <Loader2 className="spin" size={16} /> : null} SAVE DRAFT</button>
        {agreement.status === "draft" && <button className="button button-accent" disabled={send.isPending} onClick={async () => { await update.mutateAsync({ id: agreement.id, ...form }); send.mutate({ id: agreement.id }); }}><Send size={15} /> SEND TO CLIENT</button>}
      </div>
    </>}
  </section>;
}

function FilesTab({ projectId, attachments, refetch }: { projectId: number; attachments: any[]; refetch: () => void }) {
  const upload = trpc.admin.uploadProjectFile.useMutation({ onSuccess: () => refetch() });
  return <section className="dashboard-panel wide">
    <div className="panel-heading"><h2>FILES</h2><span className="section-kicker">{attachments.length} ITEMS</span></div>
    <div className="file-status-list">{attachments.map(a => <div key={a.id}><a href={a.url} target="_blank" rel="noreferrer">{a.filename}</a><span>{new Date(a.createdAt).toLocaleDateString()}</span></div>)}{!attachments.length && <div className="empty-panel"><FileText size={24} /><p>No files uploaded yet.</p></div>}</div>
    <div className="file-drop" style={{ marginTop: "1.25rem" }}>
      <span>UPLOAD FILE</span>
      <input type="file" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; const base64 = await readAsBase64(file); upload.mutate({ projectId, filename: file.name, mimeType: file.type || "application/octet-stream", base64 }); }} />
      {upload.isPending && <p><Loader2 className="spin" size={14} /> Uploading…</p>}
    </div>
  </section>;
}

function MessagesTab({ projectId, clientId, messages, refetch }: { projectId: number; clientId: number | null; messages: any[]; refetch: () => void }) {
  const [body, setBody] = useState("");
  const send = trpc.admin.sendMessage.useMutation({ onSuccess: () => { setBody(""); refetch(); } });
  return <section className="dashboard-panel wide">
    <div className="panel-heading"><h2>MESSAGES</h2></div>
    <div className="workspace-list">{messages.map(m => <article key={m.id}><span>{new Date(m.createdAt).toLocaleString()}</span><p>{m.body}</p></article>)}{!messages.length && <div className="empty-panel"><Send size={24} /><p>No messages yet.</p></div>}</div>
    <form className="inline-edit" style={{ marginTop: "1.25rem" }} onSubmit={(e: FormEvent) => { e.preventDefault(); if (body.trim() && clientId) send.mutate({ projectId, recipientId: clientId, body }); }}>
      <input className="form-input" placeholder="Message the client…" value={body} onChange={e => setBody(e.target.value)} disabled={!clientId} />
      <button className="button button-accent" disabled={!clientId || send.isPending}>{send.isPending ? <Loader2 className="spin" size={16} /> : <Send size={16} />} SEND</button>
    </form>
  </section>;
}

export default function AdminProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const detail = trpc.admin.projectDetail.useQuery({ id: projectId });
  const update = trpc.admin.updateProject.useMutation({ onSuccess: () => detail.refetch() });
  const [tab, setTab] = useState<Tab>("overview");
  if (!detail.data) return <Shell admin><main className="system-page centered-state"><p>Loading project…</p></main></Shell>;
  const { project, milestones, deliverables, activity, attachments, agreement, messages } = detail.data;
  const tabs: { key: Tab; label: string }[] = [{ key: "overview", label: "OVERVIEW" }, { key: "milestones", label: "MILESTONES" }, { key: "deliverables", label: "DELIVERABLES" }, { key: "agreement", label: "AGREEMENT" }, { key: "files", label: "FILES" }, { key: "messages", label: "MESSAGES" }];
  return <Shell admin>
    <div className="dashboard-heading compact">
      <div><p className="section-kicker">/ PROJECT #{project.id}</p><h1>{project.title.toUpperCase()}<span>.</span></h1></div>
      <div className="inline-edit">
        <select className="status-select" value={project.status} onChange={e => update.mutate({ id: project.id, status: e.target.value as any })}><option value="planning">planning</option><option value="in_progress">in progress</option><option value="review">review</option><option value="completed">completed</option><option value="on_hold">on hold</option></select>
        <input className="progress-input" type="number" min="0" max="100" value={project.progress} onChange={e => update.mutate({ id: project.id, progress: Number(e.target.value) })} />
        <input className="deadline-input" type="date" value={project.deadline ? new Date(project.deadline).toISOString().slice(0, 10) : ""} onChange={e => update.mutate({ id: project.id, deadline: e.target.value ? new Date(e.target.value) : undefined })} />
        <label className="signature-agree" style={{ margin: 0 }}><input type="checkbox" checked={project.isPublic} onChange={e => update.mutate({ id: project.id, isPublic: e.target.checked })} /> Public</label>
        <label className="signature-agree" style={{ margin: 0 }}><input type="checkbox" checked={project.isFeatured} onChange={e => update.mutate({ id: project.id, isFeatured: e.target.checked })} /> Featured</label>
      </div>
    </div>
    <div className="portal-stats"><div><span>PROGRESS</span><strong>{project.progress}%</strong></div><div><span>MILESTONES DONE</span><strong>{milestones.filter((m: any) => m.status === "completed").length}/{milestones.length}</strong></div><div><span>DELIVERABLES DONE</span><strong>{deliverables.filter((d: any) => d.status === "completed").length}/{deliverables.length}</strong></div><div><span>AGREEMENT</span><strong>{agreement?.status ?? "none"}</strong></div></div>
    <nav className="detail-tabs">{tabs.map(t => <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>{t.label}</button>)}</nav>
    <div className="dashboard-grid">
      {tab === "overview" && <section className="dashboard-panel wide"><div className="panel-heading"><h2>ACTIVITY</h2></div>{activity.length ? activity.map((a: any) => <div className="activity-timeline" key={a.id}><b>{a.eventType.replace(/_/g, " ")}</b><span>{a.body} · {new Date(a.createdAt).toLocaleString()}</span></div>) : <div className="empty-panel"><FileText size={24} /><p>No activity recorded yet.</p></div>}</section>}
      {tab === "milestones" && <MilestonesTab projectId={project.id} milestones={milestones} refetch={() => detail.refetch()} />}
      {tab === "deliverables" && <DeliverablesTab projectId={project.id} milestones={milestones} deliverables={deliverables} refetch={() => detail.refetch()} />}
      {tab === "agreement" && <AgreementTab projectId={project.id} clientId={project.clientId} agreement={agreement} refetch={() => detail.refetch()} />}
      {tab === "files" && <FilesTab projectId={project.id} attachments={attachments} refetch={() => detail.refetch()} />}
      {tab === "messages" && <MessagesTab projectId={project.id} clientId={project.clientId} messages={messages} refetch={() => detail.refetch()} />}
    </div>
  </Shell>;
}
