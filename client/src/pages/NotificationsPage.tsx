import { Link } from "wouter";
import { Bell } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Shell from "@/components/DashboardShell";

export default function NotificationsPage({ admin = false }: { admin?: boolean }) {
  const adminQuery = trpc.admin.notifications.useQuery(undefined, { enabled: admin });
  const portalQuery = trpc.portal.notifications.useQuery(undefined, { enabled: !admin });
  const data = admin ? adminQuery.data : portalQuery.data;
  const refetch = () => (admin ? adminQuery.refetch() : portalQuery.refetch());
  const markRead = trpc.portal.markNotificationRead.useMutation({ onSuccess: () => refetch() });

  const handleClick = (id: number, isRead: boolean) => {
    if (!isRead) markRead.mutate({ id });
  };

  return <Shell admin={admin}>
    <div className="dashboard-heading"><div><p className="section-kicker">/ NOTIFICATIONS</p><h1>YOUR<br /><span>NOTIFICATIONS.</span></h1></div></div>
    <section className="dashboard-panel wide">
      <div className="panel-heading"><h2>ALL NOTIFICATIONS</h2><Bell size={18} /></div>
      {data?.length ? <div className="workspace-list">
        {data.map((notification) => {
          const content = <>
            <strong style={{ fontWeight: notification.isRead ? 400 : 700 }}>
              {!notification.isRead && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", marginRight: ".5rem" }} />}
              {notification.title}
            </strong>
            <span>{notification.type}</span>
            <p>{notification.body}</p>
            <small>{new Date(notification.createdAt).toLocaleString()}</small>
          </>;
          return notification.href
            ? <Link href={notification.href} key={notification.id}><article onClick={() => handleClick(notification.id, notification.isRead)} style={{ cursor: "pointer" }}>{content}</article></Link>
            : <article key={notification.id} onClick={() => handleClick(notification.id, notification.isRead)} style={{ cursor: notification.isRead ? "default" : "pointer" }}>{content}</article>;
        })}
      </div> : <div className="workspace-empty"><Bell size={24} /><span>No notifications yet.</span></div>}
    </section>
  </Shell>;
}
