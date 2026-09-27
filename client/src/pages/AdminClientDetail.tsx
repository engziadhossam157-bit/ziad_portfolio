import { FormEvent, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowUpRight, FileText, Inbox, Loader2, StickyNote, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

export default function AdminClientDetail() {
  const { id } = useParams<{ id: string }>();
  const clientId = Number(id);
  const detail = trpc.admin.clients.detail.useQuery({ id: clientId });
  const updateStatus = trpc.admin.clients.updateStatus.useMutation({ onSuccess: () => detail.refetch() });
  const addNote = trpc.admin.clients.addNote.useMutation({ onSuccess: () => { setNoteBody(""); detail.refetch(); } });
  const deleteNote = trpc.admin.clients.deleteNote.useMutation({ onSuccess: () => detail.refetch() });
  const [noteBody, setNoteBody] = useState<string>("");

  if (!detail.data) return <Shell admin><main className="system-page centered-state"><p>Loading client…</p></main></Shell>;
  const { client, projects, notes, requests, meetings } = detail.data;

  const submitNote = (e: FormEvent) => {
    e.preventDefault();
    if (noteBody.trim()) addNote.mutate({ clientId, body: noteBody });
  };

  return <Shell admin><div className="admin-page-wrap">
    <div className="dashboard-heading compact">
      <div>
        <p className="section-kicker"><Link href="/admin/clients"><ArrowLeft size={12} style={{ verticalAlign: "-1px" }} /> CLIENT MANAGEMENT</Link> / CLIENT #{client.id}</p>
        <h1>{(client.name || client.email).toUpperCase()}<span>.</span></h1>
      </div>
      <div className="inline-edit">
        <select className="status-select" value={client.status} onChange={e => updateStatus.mutate({ id: clientId, status: e.target.value as "lead" | "active" | "inactive" })}>
          <option value="lead">lead</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
      </div>
    </div>

    <div className="dashboard-grid">
      <section className="dashboard-panel">
        <div className="panel-heading"><h2>PROFILE</h2><span className={`status-pill ${client.status}`}>{client.status}</span></div>
        <div className="workspace-list">
          <article><span>EMAIL</span><p>{client.email}</p></article>
          <article><span>PHONE</span><p>{client.phone || "—"}</p></article>
          <article><span>COMPANY</span><p>{client.company || "—"}</p></article>
          <article><span>ADDRESS</span><p>{client.address || "—"}</p></article>
          <article><span>LAST SIGNED IN</span><p>{client.lastSignedIn ? new Date(client.lastSignedIn).toLocaleString() : "—"}</p></article>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading"><h2>PROJECTS</h2><span className="section-kicker">{projects.length} ITEMS</span></div>
        <div className="workspace-list">
          {projects.map(project => <article key={project.id}>
            <Link href={`/admin/projects/${project.id}`}><strong>{project.title}</strong></Link>
            <span className={`status-pill ${project.status}`}>{project.status.replace("_", " ")}</span>
            <p>{project.progress}% complete</p>
          </article>)}
          {!projects.length && <div className="empty-panel"><ArrowUpRight size={20} /><p>No projects yet.</p></div>}
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading"><h2>REQUESTS</h2><span className="section-kicker">{requests.length} ITEMS</span></div>
        <div className="workspace-list">
          {requests.map(request => <article key={request.id}>
            <strong>{request.projectName}</strong>
            <span className={`status-pill ${request.status}`}>{request.status}</span>
            <p>{new Date(request.createdAt).toLocaleDateString()}</p>
          </article>)}
          {!requests.length && <div className="empty-panel"><Inbox size={20} /><p>No project requests from this client.</p></div>}
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading"><h2>MEETINGS</h2><span className="section-kicker">{meetings.length} ITEMS</span></div>
        <div className="workspace-list">
          {meetings.map(meeting => <article key={meeting.id}>
            <strong>{meeting.title}</strong>
            <span className={`status-pill ${meeting.status}`}>{meeting.status}</span>
            <p>{new Date(meeting.scheduledAt).toLocaleString()}</p>
          </article>)}
          {!meetings.length && <div className="empty-panel"><FileText size={20} /><p>No meetings booked yet.</p></div>}
        </div>
      </section>

      <section className="dashboard-panel wide">
        <div className="panel-heading"><h2>INTERNAL NOTES</h2><span className="section-kicker">{notes.length} ITEMS</span></div>
        <p className="section-kicker">INTERNAL — NEVER SHOWN TO CLIENT</p>
        <div className="note-list">
          {notes.map(note => <div className="note-item" key={note.id}>
            <p>{note.body}</p>
            <time>{new Date(note.createdAt).toLocaleString()}</time>
            <button className="icon-button" onClick={() => deleteNote.mutate({ id: note.id })} aria-label="Delete note"><Trash2 size={14} /></button>
          </div>)}
          {!notes.length && <div className="empty-panel"><StickyNote size={20} /><p>No internal notes yet.</p></div>}
        </div>
        <form className="inline-edit" style={{ marginTop: "1.25rem" }} onSubmit={submitNote}>
          <textarea className="form-input form-textarea" placeholder="Add an internal note about this client…" value={noteBody} onChange={e => setNoteBody(e.target.value)} />
          <button className="button button-accent" disabled={addNote.isPending}>{addNote.isPending ? <Loader2 className="spin" size={16} /> : <StickyNote size={16} />} ADD NOTE</button>
        </form>
      </section>
    </div>
  </div></Shell>;
}
