import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

type RequestType = "bug" | "design_change" | "content_change" | "new_feature" | "other";
type RequestPriority = "low" | "medium" | "high" | "urgent";

function NewChangeRequestForm({ projects, onCreated }: { projects: Array<{ id: number; title: string }>; onCreated: () => void }) {
  const [projectId, setProjectId] = useState<number>(projects[0]?.id ?? 0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<RequestType>("design_change");
  const [priority, setPriority] = useState<RequestPriority>("medium");
  const mutation = trpc.portal.createChangeRequest.useMutation({
    onSuccess: () => { setTitle(""); setDescription(""); onCreated(); },
  });
  return <section className="dashboard-panel change-request-panel">
    <div className="panel-heading"><h2>REQUEST A CHANGE</h2><MessageSquare size={18} /></div>
    <div className="form-grid">
      <label>PROJECT
        <select className="form-input" value={projectId} onChange={(e) => setProjectId(Number(e.target.value))}>
          {projects.length ? projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>) : <option value={0}>No active project</option>}
        </select>
      </label>
      <label>TYPE
        <select className="form-input" value={type} onChange={(e) => setType(e.target.value as RequestType)}>
          <option value="bug">Bug</option>
          <option value="design_change">Design Change</option>
          <option value="content_change">Content Change</option>
          <option value="new_feature">New Feature</option>
          <option value="other">Other</option>
        </select>
      </label>
    </div>
    <label>TITLE<input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to change?" /></label>
    <label>DETAILS<textarea className="form-input form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the request and expected result" /></label>
    <div className="change-request-actions">
      <select className="form-input" value={priority} onChange={(e) => setPriority(e.target.value as RequestPriority)}>
        <option value="low">Low priority</option>
        <option value="medium">Medium priority</option>
        <option value="high">High priority</option>
        <option value="urgent">Urgent</option>
      </select>
      <button className="button button-accent" disabled={!projectId || title.length < 2 || description.length < 10 || mutation.isPending} onClick={() => mutation.mutate({ projectId, title, description, type, priority })}>
        {mutation.isPending ? "SENDING…" : "SEND REQUEST"}
      </button>
    </div>
  </section>;
}

export default function PortalRequests() {
  const dashboard = trpc.portal.dashboard.useQuery();
  const changeRequests = trpc.portal.changeRequests.useQuery();
  const activity = trpc.portal.changeRequestActivity.useQuery();
  const projects = dashboard.data?.projects ?? [];
  return <Shell>
    <div className="dashboard-heading"><div><p className="section-kicker">/ REQUESTS</p><h1>CHANGE<br /><span>REQUESTS.</span></h1></div></div>
    <NewChangeRequestForm projects={projects} onCreated={() => changeRequests.refetch()} />
    <div className="dashboard-grid">
      <section className="dashboard-panel wide">
        <div className="panel-heading"><h2>YOUR REQUESTS</h2></div>
        {changeRequests.data?.length ? <div className="workspace-list">
          {changeRequests.data.map((item) => <article key={item.id}>
            <strong>{item.title}</strong>
            <span>{item.type.replace("_", " ")} · {item.priority} priority · {item.status}</span>
            <p>{item.description}</p>
            {activity.data?.filter((entry) => entry.request.id === item.id).map((entry) => <div className="activity-timeline" key={entry.activity.id}>
              <b>{entry.activity.eventType}</b>
              <span>{entry.activity.body} · {new Date(entry.activity.createdAt).toLocaleString()}</span>
            </div>)}
          </article>)}
        </div> : <div className="empty-panel"><MessageSquare size={24} /><p>No change requests yet. Use the form above to send your first one.</p></div>}
      </section>
    </div>
  </Shell>;
}
