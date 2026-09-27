

## First-release storage scope

The platform uses the managed S3-backed storage workflow for public project-inquiry attachments, authenticated client/request attachments, and project/milestone/deliverable files uploaded from the admin project detail hub. File bytes are not stored in database columns; only storage metadata and URLs are persisted.

## Owner notification behavior

New project requests, client messages, deliverable approvals/change requests, agreement signatures, and new bookings call the built-in owner notification channel, plus in-app notifications for every admin user (`notifications` table, rendered at `/admin/notifications` and `/portal/notifications`). Email delivery depends on the availability of the upstream notification service; a fallback channel is not configured.

## Platform scope (per `portfolio_md.md`)

The app is now the full three-experience platform: public site, admin dashboard, and client portal, sharing one database. Implemented: client management with internal admin-only notes; project milestones, deliverables, and a client approve/request-changes workflow; project agreements with a typed-signature sign-off (no drawn-signature/PDF library is installed, so "signature" is a typed full legal name in a script font plus a checkbox and timestamp); a general project activity timeline; a booking system (admin-managed meeting slots, bookable by logged-in clients or anonymous public visitors); and admin CRUD for all portfolio content (services, certificates, testimonials, experience, skills, about/profile) with the public site now reading from these tables instead of hardcoded content.

Deliberately out of scope for this release, per the spec's own V1 boundary: payments, invoicing, a blog, advanced analytics, and a complex CRM. Roles remain Admin/Client only (the `adminProcedure`/`protectedProcedure` split makes adding Super Admin/Project Manager roles later straightforward without a redesign).
