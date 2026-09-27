import { Link } from "wouter";
import { MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

export default function AdminMessages() { const rows = trpc.admin.messagesInbox.useQuery(); return <Shell admin><div className="admin-page-wrap"><div className="dashboard-heading compact"><div><p className="section-kicker">/ COMMUNICATION</p><h1>ALL<br /><span>MESSAGES.</span></h1></div></div><div className="workspace-list" style={{ margin: "0 4vw 4rem" }}>{rows.data?.map(({ message, project }) => <article key={message.id}><span>{project ? <>PROJECT · <Link href={`/admin/projects/${project.id}`}>{project.title}</Link></> : "GENERAL"}</span><p>{message.body}</p><small>{new Date(message.createdAt).toLocaleString()}</small></article>)}{!rows.data?.length && <div className="workspace-empty"><MessageSquare size={24} /><span>No messages yet.</span></div>}</div></div></Shell>; }
