import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import type { ComponentType } from "react";
import {
  ArrowUpRight, Bell, BookOpen, Briefcase, CalendarCheck, CalendarDays, FileSignature, FileText, FolderKanban,
  Inbox, LogOut, MessageSquare, Sparkles, UserCircle2, Users, Wrench,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type NavItem = [label: string, href: string, Icon: ComponentType<{ size?: number }>];
type NavGroup = { label: string | null; items: NavItem[] };

const adminNav: NavGroup[] = [
  { label: null, items: [["OVERVIEW", "/admin", FolderKanban]] },
  { label: "CLIENT MANAGEMENT", items: [["CLIENTS", "/admin/clients", Users], ["PROJECT REQUESTS", "/admin/requests", Inbox], ["CLIENT REQUESTS", "/admin/change-requests", MessageSquare], ["AGREEMENTS", "/admin/agreements", FileSignature]] },
  { label: "PROJECT MANAGEMENT", items: [["PROJECTS", "/admin/projects", FolderKanban], ["MILESTONES", "/admin/milestones", CalendarCheck], ["DELIVERABLES", "/admin/deliverables", FileText], ["REVIEWS & APPROVALS", "/admin/reviews", Sparkles], ["FILES", "/admin/files", FileText]] },
  { label: "BOOKINGS", items: [["BOOKINGS", "/admin/bookings", CalendarDays], ["MEETING SLOTS", "/admin/meeting-slots", CalendarDays]] },
  { label: "PORTFOLIO", items: [["SERVICES", "/admin/services", Wrench], ["CERTIFICATES", "/admin/certificates", BookOpen], ["EXPERIENCE", "/admin/experience", Briefcase], ["TESTIMONIALS", "/admin/testimonials", Sparkles], ["SKILLS", "/admin/skills", Sparkles], ["ABOUT / PROFILE", "/admin/about", UserCircle2]] },
  { label: "COMMUNICATION", items: [["MESSAGES", "/admin/messages", MessageSquare], ["NOTIFICATIONS", "/admin/notifications", Bell]] },
];

const clientNav: NavGroup[] = [
  { label: null, items: [["OVERVIEW", "/portal", FolderKanban], ["PROJECTS", "/portal/projects", FolderKanban], ["REQUESTS", "/portal/requests", Inbox], ["AGREEMENT", "/portal/agreements", FileSignature], ["BOOKINGS", "/portal/bookings", CalendarDays], ["FILES", "/portal/files", FileText], ["MESSAGES", "/portal/messages", MessageSquare], ["NOTIFICATIONS", "/portal/notifications", Bell], ["PROFILE", "/portal/profile", UserCircle2]] },
];

export default function DashboardShell({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { user, loading, logout } = useAuth();
  const [location, navigate] = useLocation();
  const adminNotifications = trpc.admin.notifications.useQuery(undefined, { enabled: !loading && !!user && admin });
  const portalNotifications = trpc.portal.notifications.useQuery(undefined, { enabled: !loading && !!user && !admin });
  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login");
    else if (admin && user.role !== "admin") navigate("/portal");
    else if (!admin && user.role === "admin") navigate("/admin");
  }, [admin, loading, navigate, user]);

  if (loading || !user || (admin && user.role !== "admin") || (!admin && user.role === "admin")) {
    return <main className="system-page centered-state"><p className="section-kicker">AUTHORIZING WORKSPACE</p><p>Checking your session and access role…</p></main>;
  }

  const groups = admin ? adminNav : clientNav;
  const unreadCount = (admin ? adminNotifications.data : portalNotifications.data)?.filter((n) => !n.isRead).length ?? 0;

  return <div className="dashboard-shell">
    <aside className="dashboard-sidebar">
      <div className="dash-logo-row">
        <div className="dash-logo-badge">Z</div>
        <Link href="/" className="wordmark">ZIAD<span>.</span></Link>
      </div>
      <div className="dash-role">{admin ? "ADMIN WORKSPACE" : "CLIENT PORTAL"}</div>
      {groups.map((group, i) => <div className="dash-nav-group" key={group.label ?? `group-${i}`}>
        {group.label && <span className="dash-nav-group-label">{group.label}</span>}
        <nav className="dash-nav">{group.items.map(([label, href, Icon]) => <Link key={href} href={href} className={location === href ? "active" : ""}><Icon size={16} /> {label}{href.endsWith("/notifications") && unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}</Link>)}</nav>
      </div>)}
      <div className="dash-user">
        <div className="avatar-circle">{user.name?.[0] ?? "Z"}</div>
        <div><strong>{user.name ?? "Guest"}</strong><span>{admin ? "Administrator" : "Client"}</span></div>
        <button onClick={() => logout()} aria-label="Log out"><LogOut size={16} /></button>
      </div>
    </aside>
    <section className="dashboard-content">
      <header className="dashboard-top"><span>{admin ? "COMMAND CENTER" : "PROJECT COMMAND"}</span><Link href="/" className="back-link">VIEW PUBLIC SITE <ArrowUpRight size={14} /></Link></header>
      {children}
    </section>
  </div>;
}
