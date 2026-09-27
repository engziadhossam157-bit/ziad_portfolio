import { Link } from "wouter";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

export default function PortalMessages() {
  const inbox = trpc.portal.messagesInbox.useQuery();
  const dashboard = trpc.portal.dashboard.useQuery();
  const latestProject = dashboard.data?.projects[0];
  return <Shell>
    <div className="dashboard-heading"><div><p className="section-kicker">/ MESSAGES</p><h1>YOUR<br /><span>MESSAGES.</span></h1></div></div>
    <section className="dashboard-panel wide">
      <div className="panel-heading"><h2>SENT MESSAGES</h2><MessageSquare size={18} /></div>
      <p style={{ color: "var(--muted)", fontSize: ".8rem", lineHeight: 1.6, marginBottom: "1rem" }}>
        This is a read-only log of messages you've sent. To reply or continue a conversation, open the relevant project.
        {latestProject && <> <Link href={`/portal/projects/${latestProject.id}`} style={{ color: "var(--accent)" }}>Continue in {latestProject.title} <ArrowUpRight size={12} style={{ display: "inline" }} /></Link></>}
      </p>
      {inbox.data?.length ? <div className="workspace-list">
        {inbox.data.map((message) => <article key={message.id}>
          <p>{message.body}</p>
          <small>{new Date(message.createdAt).toLocaleString()}</small>
        </article>)}
      </div> : <div className="workspace-empty"><MessageSquare size={24} /><span>No messages sent yet.</span></div>}
    </section>
  </Shell>;
}
