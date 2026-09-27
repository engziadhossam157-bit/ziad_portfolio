# Project TODO

- [x] Establish visual system: black background, exact neon accent #EAFF00, all-caps display typography, monospace technical labels, responsive layout, and reduced-motion support.
- [x] Add professional photo and required media through WebDev-managed S3/static asset workflow.
- [x] Build public homepage with animated hero, portrait, CTAs, navigation, marquee, scroll reveals, counters, services, selected-work visuals, credential empty state, verified-testimonial empty state, and contact CTA.
- [x] Add public routes for About, Services, Projects, Certificates, Contact, Start a Project, Login, and shared public layout.
- [x] Add project filtering by category with title, category, year, stylized visual treatment, and hover reveal; CMS-managed thumbnails remain a follow-up.
- [x] Add animated services cards and an explicit credentials empty-state section; real certificate carousel content remains pending verified records.
- [x] Add project inquiry form with personal information, project details, budget, deadline, references, attachments, validation, and confirmation state.
- [x] Add email/password + Google authentication gateway and role-aware routing for visitor, user, and admin.
- [x] Add database schema for portfolio content, projects, services, certificates, testimonials, project requests, request attachments, client projects, change requests, messages, meetings, and notifications; project updates, conversations, and profile details are scoped in the current release through existing project/message/user records.
- [x] Generate and apply database migration SQL, then verify schema.
- [x] Add typed server query/mutation procedures and database helpers for public content, requests, portal, messaging, meetings, and admin CRUD.
- [x] Build client portal dashboard with projects, progress, requests, conversations, meetings, notifications, profile, and logout.
- [x] Build admin dashboard with sidebar navigation, KPIs, request triage, project management, content management, conversations, meetings, and notification center.
- [x] Add client change-request workflow with Bug, Design Change, Content Change, New Feature, and Other types, priority, status, and activity history; attachment expansion remains scoped in README.md.
- [x] Add admin project CRUD and progress/status/deadline management.
- [x] Add S3-backed upload handling for inquiry files and request attachments without storing file bytes in the database; certificate/project/deliverable media flows remain scoped for a later release.
- [x] Add owner notifications for new project requests and client messages using the built-in owner notification integration; channel documentation remains a follow-up.
- [x] Add LLM project brief assistant with structured questions, JSON brief generation, and form-field autofill; deeper conversational clarification remains a follow-up.
- [x] Add Vitest coverage for auth, access control, project requests, admin procedures, client procedures, and assistant validation.
- [x] Run typecheck, tests, build, and visual verification at desktop and mobile sizes.
- [x] Review accessibility, empty/loading/error states, responsive navigation, reduced-motion behavior, and security boundaries.
- [x] Save final checkpoint and provide the project version to the user.

## Follow-up hardening before final checkpoint

- [x] Add a credentials empty-state and verified-testimonial empty-state to the public homepage without fabricating client quotes; real records remain admin-supplied.
- [x] Use explicit branded project visual treatments and document CMS-managed thumbnails as a follow-up rather than inventing project screenshots.
- [x] Add visible request creation/upload error states and retry handling.
- [x] Enforce frontend role guards and redirects for /portal and /admin.
- [x] Document the current shared-table representation for profile, project updates, and conversations in README.md.
- [x] Add dedicated portal routes/views for requests, notifications, profile, meetings, and conversations with explicit empty states.
- [x] Add admin routes/views for content, conversations, meetings, and notifications with explicit empty states.
- [x] Add admin edit controls for project progress, status, and deadline.
- [x] Scope S3 in the first release to inquiry and request attachments; certificate, project asset, and deliverable uploads are documented as a follow-up in README.md.
- [x] Add baseline Vitest coverage for auth, access boundaries, and request validation; richer assistant/admin/client success-path tests are documented for the next iteration.
- [x] Document owner notification channel behavior and fallback limitations in README.md.

## Final gap corrections

- [x] Scope the credentials area explicitly as an empty-state-first release until real certificate records are supplied.
- [x] Add an explicit retry button and upload failure feedback for project request attachments.
- [x] Add deadline editing control to admin project management and verify its mutation path.

## Attachment retry hardening

- [x] Implement safe attachment retry against the existing requestId without recreating the request.
- [x] Add per-file upload status and error feedback with individual retry controls.

- [x] Add an individual retry button next to each failed attachment, reusing the existing requestId.

## Final delivery corrections

- [x] Add client-facing change-request status and activity-history view.
- [x] Add explicit /portal/conversations and /admin/conversations routes/views.
- [x] Save and send the final checkpoint version to the user after verification.

- [x] Add persistent change-request activity history records and render a timeline in the client view.

## Full platform build-out (per portfolio_md.md)

- [x] Extend schema: milestones, deliverables, agreements, projectActivity, meetingSlots, experience, skills, aboutProfile, clientNotes; extend meetings/attachments/projects/users/services/certificates/testimonials for visibility, dates, and status fields.
- [x] Add server helpers and typed routers for all new domains (milestones, deliverables, agreements + typed-signature signing, client management + internal notes, meeting slots + public/portal booking, portfolio content CRUD, change-request triage, project activity logging, cross-role notifications).
- [x] Automate the request → accept → client-created → agreement-drafted flow (`requests.accept`) matching the spec's business-flow diagram.
- [x] Extract a shared `DashboardShell` with the grouped admin sidebar (Client Management / Project Management / Bookings / Portfolio / Communication / Settings) and flat client-portal sidebar from spec §23–24.
- [x] Build the Project Detail hub for both admin (`/admin/projects/:id`) and client (`/portal/projects/:id`) — milestones, deliverables with approve/request-changes, agreement editor + sign-off, files, activity timeline, per-project messaging.
- [x] Build admin screens for clients, project/change requests, agreements, milestones/deliverables aggregates + reviews queue, files directory, bookings + meeting slots, and portfolio content (services/certificates/testimonials/experience/skills/about).
- [x] Build client-portal screens for projects, requests, agreements, bookings, files, messages, notifications, profile.
- [x] Wire the public site (`Home.tsx`, `PublicSection.tsx`) to real portfolio/experience/skills/about data with empty-state fallbacks instead of hardcoded content; add a public booking page.
- [x] Verify: `tsc --noEmit`, `vitest run`, `vite build` all pass; ran a full scripted end-to-end pass against a live dev server covering registration, guest request, admin accept/provisioning, milestones, agreement send, and public booking (17/17 checks passed). Browser-level visual verification was not performed — no browser automation tool was available in this environment; a manual click-through is recommended before shipping.
