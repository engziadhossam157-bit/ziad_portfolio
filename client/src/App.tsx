import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

// Only the landing page ships in the entry bundle; every other route loads on demand, so
// public visitors never download the portal and admin workspaces.
const About = lazy(() => import("./pages/About"));
const StartProject = lazy(() => import("./pages/StartProject"));
const BookMeeting = lazy(() => import("./pages/BookMeeting"));
const PublicSection = lazy(() => import("./pages/PublicSection"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Portal = lazy(() => import("./pages/Portal"));
const Admin = lazy(() => import("./pages/Portal").then((m) => ({ default: m.Admin })));
const AdminProjects = lazy(() => import("./pages/AdminProjects"));
const AdminProjectDetail = lazy(() => import("./pages/AdminProjectDetail"));
const ClientProjectDetail = lazy(() => import("./pages/ClientProjectDetail"));
const PortalProjects = lazy(() => import("./pages/PortalProjects"));
const PortalRequests = lazy(() => import("./pages/PortalRequests"));
const PortalAgreements = lazy(() => import("./pages/PortalAgreements"));
const PortalBookings = lazy(() => import("./pages/PortalBookings"));
const PortalFiles = lazy(() => import("./pages/PortalFiles"));
const PortalMessages = lazy(() => import("./pages/PortalMessages"));
const PortalProfile = lazy(() => import("./pages/PortalProfile"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const AdminClients = lazy(() => import("./pages/AdminClients"));
const AdminClientDetail = lazy(() => import("./pages/AdminClientDetail"));
const AdminRequests = lazy(() => import("./pages/AdminRequests"));
const AdminChangeRequests = lazy(() => import("./pages/AdminChangeRequests"));
const AdminAgreements = lazy(() => import("./pages/AdminAgreements"));
const AdminMilestones = lazy(() => import("./pages/AdminMilestones"));
const AdminDeliverables = lazy(() => import("./pages/AdminDeliverables"));
const AdminFiles = lazy(() => import("./pages/AdminFiles"));
const AdminBookings = lazy(() => import("./pages/AdminBookings"));
const AdminMeetingSlots = lazy(() => import("./pages/AdminMeetingSlots"));
const AdminServices = lazy(() => import("./pages/AdminServices"));
const AdminCertificates = lazy(() => import("./pages/AdminCertificates"));
const AdminTestimonials = lazy(() => import("./pages/AdminTestimonials"));
const AdminExperience = lazy(() => import("./pages/AdminExperience"));
const AdminSkills = lazy(() => import("./pages/AdminSkills"));
const AdminAbout = lazy(() => import("./pages/AdminAbout"));
const AdminMessages = lazy(() => import("./pages/AdminMessages"));

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/start-project" component={StartProject} />
    <Route path="/book-a-meeting" component={BookMeeting} />
    <Route path="/about" component={About} />
    <Route path="/services" component={PublicSection} />
    <Route path="/projects" component={PublicSection} />
    <Route path="/certificates" component={PublicSection} />
    <Route path="/contact" component={PublicSection} />
    <Route path="/login" component={Login} />
    <Route path="/portal" component={Portal} />
    <Route path="/portal/projects" component={PortalProjects} />
    <Route path="/portal/projects/:id" component={ClientProjectDetail} />
    <Route path="/portal/requests" component={PortalRequests} />
    <Route path="/portal/agreements" component={PortalAgreements} />
    <Route path="/portal/bookings" component={PortalBookings} />
    <Route path="/portal/files" component={PortalFiles} />
    <Route path="/portal/meetings" component={PortalBookings} />
    <Route path="/portal/messages" component={PortalMessages} />
    <Route path="/portal/conversations" component={PortalMessages} />
    <Route path="/portal/notifications" component={() => <NotificationsPage />} />
    <Route path="/portal/profile" component={PortalProfile} />
    <Route path="/admin" component={Admin} />
    <Route path="/admin/clients" component={AdminClients} />
    <Route path="/admin/clients/:id" component={AdminClientDetail} />
    <Route path="/admin/requests" component={AdminRequests} />
    <Route path="/admin/change-requests" component={AdminChangeRequests} />
    <Route path="/admin/agreements" component={AdminAgreements} />
    <Route path="/admin/projects" component={AdminProjects} />
    <Route path="/admin/projects/:id" component={AdminProjectDetail} />
    <Route path="/admin/milestones" component={AdminMilestones} />
    <Route path="/admin/deliverables" component={() => <AdminDeliverables />} />
    <Route path="/admin/reviews" component={() => <AdminDeliverables reviewOnly />} />
    <Route path="/admin/files" component={AdminFiles} />
    <Route path="/admin/bookings" component={AdminBookings} />
    <Route path="/admin/meeting-slots" component={AdminMeetingSlots} />
    <Route path="/admin/services" component={AdminServices} />
    <Route path="/admin/certificates" component={AdminCertificates} />
    <Route path="/admin/testimonials" component={AdminTestimonials} />
    <Route path="/admin/experience" component={AdminExperience} />
    <Route path="/admin/skills" component={AdminSkills} />
    <Route path="/admin/about" component={AdminAbout} />
    <Route path="/admin/messages" component={AdminMessages} />
    <Route path="/admin/conversations" component={AdminMessages} />
    <Route path="/admin/meetings" component={AdminBookings} />
    <Route path="/admin/notifications" component={() => <NotificationsPage admin />} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><Suspense fallback={<div className="route-loading" aria-busy="true" />}><Router /></Suspense></ThemeProvider></ErrorBoundary>;
}
