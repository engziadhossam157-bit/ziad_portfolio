import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS, samePhone } from "@shared/const";
import { ENV } from "./_core/env";
import { getSessionCookieOptions } from "./_core/cookies";
import { isGoogleLoginConfigured } from "./_core/google";
import { hashPassword, verifyPassword } from "./_core/password";
import { createSessionToken } from "./_core/session";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import {
  hasAdminWithPassword, setAdminPassword, setUserPhone, touchSignIn,
  createAgreement, createAttachment, createChangeRequest, createClientNote, createClientUser, createDeliverable,
  createExperience, createMeeting, createMeetingSlot, createMessage, createMilestone, createNotification,
  createProject, createProjectRequest, createService, createCertificate, createTestimonial, createSkill,
  createUserWithPassword, deleteClientNote, deleteCertificate, deleteDeliverable, deleteExperience, deleteMeetingSlot,
  deleteMilestone, deleteProject, deleteService, deleteSkill, deleteTestimonial, createChangeRequestActivity,
  getAboutProfile, getAdminUserIds, getAgreementByProject, getAgreementById, getAllAgreements, getAllCertificates,
  getAllChangeRequests, getAllClients, getAllDeliverables, getAllExperience, getAllMeetingSlots, getAllMeetings,
  getAllMessagesWithProject, getAllMilestones, getAllProjects, getAllPublicProjects, getAllServices, getAllSkills,
  getAllTestimonials, getAttachmentsForProject, getAvailableMeetingSlots, getChangeRequestActivityForUser,
  getChangeRequestsForUser, getClientNotes, getDashboardCounts, getDeliverableById, getDeliverablesForProject,
  getMeetingSlotById, getMeetingsForUser, getMessagesForProject, getMessagesForUser, getMilestonesForProject,
  getNotificationsForUser, getProjectActivity, getProjectById, getProjectsForUser, getPublicExperience,
  getPublicPortfolio, getPublicSkills, getRequestsForAdmin, getRequestsForUser, getUserByEmail, getUserById,
  logProjectActivity, markNotificationRead, updateAgreement, updateChangeRequestStatus, updateClient,
  updateDeliverable, updateExperience, updateMeeting, updateMeetingSlot, updateMilestone, updateProject,
  updateCertificate, updateService, updateSkill, updateTestimonial, updateRequestStatus, updateUserProfile,
  upsertAboutProfile,
} from "./db";
import { storagePut } from "./storage";

const projectRequestInput = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().min(7), company: z.string().optional(), projectName: z.string().min(2), projectType: z.string().min(2), description: z.string().min(20), requiredFeatures: z.string().optional(), budget: z.string().optional(), deadline: z.coerce.date().optional(), referenceUrls: z.string().optional() });

// Sign-in throttle: 8 tries per 15 minutes per account. In-memory, so per server instance.
// ponytail: per-instance counter; move to the database if brute force becomes a real concern.
const attempts = new Map<string, number[]>();
function throttle(key: string) {
  const now = Date.now(), recent = (attempts.get(key) ?? []).filter(t => now - t < 15 * 60_000);
  if (recent.length >= 8) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many sign-in attempts. Try again in 15 minutes." });
  attempts.set(key, [...recent, now]);
}

/** A user row as the browser may see it: never the password hash or Google ID. */
function publicUser<T extends { passwordHash?: string | null; googleId?: string | null } | null | undefined>(user: T) {
  if (!user) return null;
  const { passwordHash: _hash, googleId: _google, ...rest } = user;
  return rest;
}

function slugify(input: string): string { return `${input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`; }

async function setSessionCookie(ctx: { req: any; res: any }, userId: number) {
  const sessionToken = await createSessionToken(userId, { expiresInMs: ONE_YEAR_MS });
  const cookieOptions = getSessionCookieOptions(ctx.req);
  ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
}

async function notifyAdmins(input: { type: string; title: string; body: string; href?: string }) {
  const adminIds = await getAdminUserIds();
  await Promise.all(adminIds.map(userId => createNotification({ userId, type: input.type, title: input.title, body: input.body, href: input.href })));
  await notifyOwner({ title: input.title, content: input.body });
}

async function assertOwnsProject(userId: number, projectId: number) {
  const project = await getProjectById(projectId);
  if (!project || project.clientId !== userId) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this project." });
  return project;
}

function decodeUpload(base64: string, maxBytes = 12 * 1024 * 1024) {
  const raw = base64.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(raw, "base64");
  if (buffer.byteLength > maxBytes) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "File exceeds size limit" });
  return buffer;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => publicUser(opts.ctx.user)),
    googleEnabled: publicProcedure.query(() => isGoogleLoginConfigured()),
    // Admin and client sign-in are separate. There is no public sign-up: the owner sets the admin
    // password once, and client accounts are created only when the admin accepts a project request.
    adminSetupNeeded: publicProcedure.query(async () => !(await hasAdminWithPassword())),
    adminSetup: publicProcedure
      .input(z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) }))
      .mutation(async ({ input, ctx }) => {
        if (await hasAdminWithPassword()) throw new TRPCError({ code: "FORBIDDEN", message: "The admin account is already set up. Sign in instead." });
        if (!ENV.ownerEmail) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OWNER_EMAIL is not set on the server." });
        if (input.email.toLowerCase() !== ENV.ownerEmail) throw new TRPCError({ code: "FORBIDDEN", message: "Only the site owner's email can set up the admin account." });
        const passwordHash = await hashPassword(input.password);
        const existing = await getUserByEmail(input.email);
        const userId = existing ? existing.id : await createUserWithPassword({ email: input.email, passwordHash, name: input.name });
        await setAdminPassword(userId, { passwordHash, name: input.name });
        await setSessionCookie(ctx, userId);
        return publicUser(await getUserById(userId));
      }),
    adminLogin: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        throttle(`admin:${input.email.toLowerCase()}`);
        const user = await getUserByEmail(input.email);
        const valid = !!user?.passwordHash && user.role === "admin" && (await verifyPassword(input.password, user.passwordHash));
        if (!user || !valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        await setSessionCookie(ctx, user.id);
        await touchSignIn(user.id);
        return publicUser(user);
      }),
    clientLogin: publicProcedure
      .input(z.object({ email: z.string().email(), phone: z.string().min(7) }))
      .mutation(async ({ input, ctx }) => {
        throttle(`client:${input.email.toLowerCase()}`);
        const user = await getUserByEmail(input.email);
        if (!user || user.role !== "user" || user.status === "inactive" || !samePhone(user.phone, input.phone)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "No approved project matches this email and phone. If you sent a project request, you can sign in once it is approved." });
        }
        await setSessionCookie(ctx, user.id);
        await touchSignIn(user.id);
        return publicUser(user);
      }),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  portfolio: router({
    public: publicProcedure.query(() => getPublicPortfolio()),
    allProjects: publicProcedure.query(() => getAllPublicProjects()),
    experience: publicProcedure.query(() => getPublicExperience()),
    skills: publicProcedure.query(() => getPublicSkills()),
    about: publicProcedure.query(() => getAboutProfile()),
  }),
  bookings: router({
    availableSlots: publicProcedure.query(() => getAvailableMeetingSlots()),
    book: publicProcedure
      .input(z.object({ slotId: z.number(), name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), notes: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const slot = await getMeetingSlotById(input.slotId);
        if (!slot || slot.status !== "available" || slot.startTime.getTime() <= Date.now()) throw new TRPCError({ code: "CONFLICT", message: "That time is no longer available." });
        await updateMeetingSlot(slot.id, { status: "booked" });
        const meetingId = await createMeeting({
          slotId: slot.id, clientId: ctx.user?.id ?? null, title: "Consultation Call", scheduledAt: slot.startTime,
          durationMinutes: slot.durationMinutes, notes: input.notes,
          guestName: ctx.user ? null : input.name, guestEmail: ctx.user ? null : input.email, guestPhone: ctx.user ? null : (input.phone ?? null),
        });
        await notifyAdmins({ type: "booking", title: "New meeting booked", body: `${ctx.user?.name ?? input.name} booked a call for ${slot.startTime.toLocaleString()}.`, href: "/admin/bookings" });
        return { success: true, meetingId };
      }),
  }),
  requests: router({
    create: publicProcedure.input(projectRequestInput).mutation(async ({ input, ctx }) => { const requestId = await createProjectRequest({ ...input, userId: ctx.user?.id ?? null }); await notifyAdmins({ type: "request", title: "New project request", body: `${input.name} submitted “${input.projectName}” (${input.projectType}).`, href: "/admin/requests" }); return { success: true, requestId }; }),
    uploadPublicAttachment: publicProcedure.input(z.object({ requestId: z.number(), filename: z.string().min(1), mimeType: z.string().min(1), base64: z.string().min(1) })).mutation(async ({ input }) => { const buffer = decodeUpload(input.base64); const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-"); const { key, url } = await storagePut(`public-request-${input.requestId}/${Date.now()}-${safeName}`, buffer, input.mimeType); await createAttachment({ requestId: input.requestId, filename: input.filename, mimeType: input.mimeType, size: buffer.byteLength, storageKey: key, url }); return { key, url }; }),
    mine: protectedProcedure.query(({ ctx }) => getRequestsForUser(ctx.user.id)),
    adminList: adminProcedure.query(() => getRequestsForAdmin()),
    setStatus: adminProcedure.input(z.object({ id: z.number(), status: z.enum(["new", "reviewing", "accepted", "declined", "converted"]) })).mutation(({ input }) => updateRequestStatus(input.id, input.status)),
    accept: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const requests = await getRequestsForAdmin();
      const request = requests.find(r => r.id === input.id);
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Request not found." });
      let clientId = request.userId ?? undefined;
      if (!clientId) {
        const existing = await getUserByEmail(request.email);
        if (existing?.role === "admin") throw new TRPCError({ code: "BAD_REQUEST", message: "This request uses the admin email. Clients need their own email." });
        clientId = existing ? existing.id : await createClientUser({ email: request.email, name: request.name, phone: request.phone, company: request.company });
      }
      // The client signs in with the request's email and phone, so make sure the account has that phone.
      const client = await getUserById(clientId);
      if (request.phone && !samePhone(client?.phone, request.phone)) await setUserPhone(clientId, request.phone);
      const projectId = await createProject({ title: request.projectName, slug: slugify(request.projectName), description: request.description, category: request.projectType, year: new Date().getFullYear(), clientId, status: "planning", isPublic: false, deadline: request.deadline ?? null });
      await createAgreement({ projectId, clientId, status: "draft" });
      await updateRequestStatus(request.id, "accepted");
      await logProjectActivity(projectId, null, "created", "Project created from accepted request.");
      await createNotification({ userId: clientId, type: "request", title: "Your project was accepted", body: `“${request.projectName}” is now set up in your client portal. Sign in with ${request.email} and the phone number from your request.`, href: `/portal/projects/${projectId}` });
      return { success: true, projectId, clientId };
    }),
  }),
  portal: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => { const [projects, requests, meetings, messages, notifications] = await Promise.all([getProjectsForUser(ctx.user.id), getRequestsForUser(ctx.user.id), getMeetingsForUser(ctx.user.id), getMessagesForUser(ctx.user.id), getNotificationsForUser(ctx.user.id)]); return { projects, requests, meetings, messages, notifications }; }),
    projectDetail: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
      const project = await assertOwnsProject(ctx.user.id, input.id);
      const [milestones, deliverables, activity, attachments, agreement, messages] = await Promise.all([getMilestonesForProject(project.id), getDeliverablesForProject(project.id), getProjectActivity(project.id), getAttachmentsForProject(project.id), getAgreementByProject(project.id), getMessagesForProject(project.id)]);
      return { project, milestones, deliverables, activity, attachments, agreement, messages };
    }),
    approveDeliverable: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      const deliverable = await getDeliverableById(input.id);
      if (!deliverable) throw new TRPCError({ code: "NOT_FOUND", message: "Deliverable not found." });
      await assertOwnsProject(ctx.user.id, deliverable.projectId);
      await updateDeliverable(deliverable.id, { status: "completed", reviewNote: null });
      await logProjectActivity(deliverable.projectId, ctx.user.id, "deliverable_approved", `Client approved “${deliverable.title}”.`);
      await notifyAdmins({ type: "deliverable", title: "Deliverable approved", body: `${ctx.user.name ?? ctx.user.email} approved “${deliverable.title}”.`, href: `/admin/projects/${deliverable.projectId}` });
      return { success: true };
    }),
    requestDeliverableChanges: protectedProcedure.input(z.object({ id: z.number(), reason: z.string().min(3) })).mutation(async ({ input, ctx }) => {
      const deliverable = await getDeliverableById(input.id);
      if (!deliverable) throw new TRPCError({ code: "NOT_FOUND", message: "Deliverable not found." });
      await assertOwnsProject(ctx.user.id, deliverable.projectId);
      await updateDeliverable(deliverable.id, { status: "changes_requested", reviewNote: input.reason });
      await logProjectActivity(deliverable.projectId, ctx.user.id, "changes_requested", `Client requested changes on “${deliverable.title}”: ${input.reason}`);
      await notifyAdmins({ type: "deliverable", title: "Changes requested", body: `${ctx.user.name ?? ctx.user.email} requested changes on “${deliverable.title}”.`, href: `/admin/projects/${deliverable.projectId}` });
      return { success: true };
    }),
    agreement: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input, ctx }) => { await assertOwnsProject(ctx.user.id, input.projectId); return getAgreementByProject(input.projectId); }),
    signAgreement: protectedProcedure.input(z.object({ id: z.number(), fullName: z.string().min(2) })).mutation(async ({ input, ctx }) => {
      const agreement = await getAgreementById(input.id);
      if (!agreement || agreement.clientId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this agreement." });
      if (agreement.status !== "sent") throw new TRPCError({ code: "BAD_REQUEST", message: "This agreement is not ready to sign." });
      await updateAgreement(agreement.id, { status: "signed", signedName: input.fullName, signedAt: new Date() });
      await logProjectActivity(agreement.projectId, ctx.user.id, "agreement_signed", `Agreement signed by ${input.fullName}.`);
      await updateProject(agreement.projectId, { status: "in_progress" });
      await notifyAdmins({ type: "agreement", title: "Agreement signed", body: `${input.fullName} signed the agreement.`, href: `/admin/projects/${agreement.projectId}` });
      return { success: true };
    }),
    myBookings: protectedProcedure.query(({ ctx }) => getMeetingsForUser(ctx.user.id)),
    changeRequests: protectedProcedure.query(({ ctx }) => getChangeRequestsForUser(ctx.user.id)),
    changeRequestActivity: protectedProcedure.query(({ ctx }) => getChangeRequestActivityForUser(ctx.user.id)),
    createChangeRequest: protectedProcedure.input(z.object({ projectId: z.number(), title: z.string().min(2), description: z.string().min(10), type: z.enum(["bug", "design_change", "content_change", "new_feature", "other"]), priority: z.enum(["low", "medium", "high", "urgent"]).default("medium") })).mutation(async ({ input, ctx }) => { const result = await createChangeRequest({ ...input, userId: ctx.user.id }); const insertId = Number((result as any).insertId ?? (result as any)[0]?.insertId ?? (result as any).lastInsertRowid); await createChangeRequestActivity({ changeRequestId: insertId, actorId: ctx.user.id, eventType: "created", body: "Change request submitted" }); await notifyAdmins({ type: "change_request", title: "New client request", body: input.title, href: "/admin/requests" }); return { success: true, id: insertId }; }),
    sendMessage: protectedProcedure.input(z.object({ projectId: z.number().optional(), recipientId: z.number().optional(), body: z.string().min(1) })).mutation(async ({ input, ctx }) => { await createMessage({ ...input, senderId: ctx.user.id }); await notifyAdmins({ type: "message", title: "New client message", body: input.body.slice(0, 240), href: input.projectId ? `/admin/projects/${input.projectId}` : "/admin/messages" }); return { success: true }; }),
    uploadAttachment: protectedProcedure.input(z.object({ filename: z.string().min(1), mimeType: z.string().min(1), base64: z.string().min(1), requestId: z.number().optional(), projectId: z.number().optional(), changeRequestId: z.number().optional() })).mutation(async ({ input, ctx }) => { const buffer = decodeUpload(input.base64); const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-"); const { key, url } = await storagePut(`user-${ctx.user.id}/${Date.now()}-${safeName}`, buffer, input.mimeType); await createAttachment({ uploaderId: ctx.user.id, requestId: input.requestId, projectId: input.projectId, changeRequestId: input.changeRequestId, filename: input.filename, mimeType: input.mimeType, size: buffer.byteLength, storageKey: key, url }); return { key, url, filename: input.filename }; }),
    markNotificationRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => markNotificationRead(input.id)),
    notifications: protectedProcedure.query(({ ctx }) => getNotificationsForUser(ctx.user.id)),
    messagesInbox: protectedProcedure.query(({ ctx }) => getMessagesForUser(ctx.user.id)),
    updateProfile: protectedProcedure.input(z.object({ name: z.string().min(1).optional(), phone: z.string().optional(), company: z.string().optional(), address: z.string().optional() })).mutation(({ input, ctx }) => updateUserProfile(ctx.user.id, input)),
  }),
  admin: router({
    dashboard: adminProcedure.query(() => getDashboardCounts()),
    projects: adminProcedure.query(() => getAllProjects()),
    projectDetail: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const project = await getProjectById(input.id);
      if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found." });
      const [milestones, deliverables, activity, attachments, agreement, messages] = await Promise.all([getMilestonesForProject(project.id), getDeliverablesForProject(project.id), getProjectActivity(project.id), getAttachmentsForProject(project.id), getAgreementByProject(project.id), getMessagesForProject(project.id)]);
      return { project, milestones, deliverables, activity, attachments, agreement, messages };
    }),
    createProject: adminProcedure.input(z.object({ title: z.string(), slug: z.string(), description: z.string(), category: z.string(), year: z.number(), imageUrl: z.string().optional(), liveUrl: z.string().optional(), githubUrl: z.string().optional(), technologies: z.string().optional(), clientId: z.number().optional(), startDate: z.coerce.date().optional(), isFeatured: z.boolean().default(false), isPublic: z.boolean().default(true) })).mutation(({ input }) => createProject(input)),
    updateProject: adminProcedure.input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), progress: z.number().min(0).max(100).optional(), status: z.enum(["planning", "in_progress", "review", "completed", "on_hold"]).optional(), startDate: z.coerce.date().optional(), deadline: z.coerce.date().optional(), isFeatured: z.boolean().optional(), isPublic: z.boolean().optional() })).mutation(async ({ input, ctx }) => { const { id, ...changes } = input; const result = await updateProject(id, changes); if (changes.progress !== undefined) await logProjectActivity(id, ctx.user.id, "progress_changed", `Progress updated to ${changes.progress}%.`); if (changes.status) await logProjectActivity(id, ctx.user.id, "status_changed", `Status changed to ${changes.status.replace("_", " ")}.`); return result; }),
    deleteProject: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteProject(input.id)),
    uploadProjectFile: adminProcedure.input(z.object({ projectId: z.number(), filename: z.string().min(1), mimeType: z.string().min(1), base64: z.string().min(1), milestoneId: z.number().optional(), deliverableId: z.number().optional() })).mutation(async ({ input, ctx }) => { const buffer = decodeUpload(input.base64); const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-"); const { key, url } = await storagePut(`project-${input.projectId}/${Date.now()}-${safeName}`, buffer, input.mimeType); await createAttachment({ uploaderId: ctx.user.id, projectId: input.projectId, milestoneId: input.milestoneId, deliverableId: input.deliverableId, filename: input.filename, mimeType: input.mimeType, size: buffer.byteLength, storageKey: key, url }); await logProjectActivity(input.projectId, ctx.user.id, "file_uploaded", `Uploaded ${input.filename}.`); return { key, url, filename: input.filename }; }),
    sendMessage: adminProcedure.input(z.object({ projectId: z.number().optional(), recipientId: z.number(), body: z.string().min(1) })).mutation(async ({ input, ctx }) => { await createMessage({ ...input, senderId: ctx.user.id }); await createNotification({ userId: input.recipientId, type: "message", title: "New message from Ziad", body: input.body.slice(0, 240), href: input.projectId ? `/portal/projects/${input.projectId}` : "/portal/messages" }); return { success: true }; }),
    messagesInbox: adminProcedure.query(() => getAllMessagesWithProject()),
    notifications: adminProcedure.query(({ ctx }) => getNotificationsForUser(ctx.user.id)),

    milestones: router({
      list: adminProcedure.input(z.object({ projectId: z.number() })).query(({ input }) => getMilestonesForProject(input.projectId)),
      all: adminProcedure.query(() => getAllMilestones()),
      create: adminProcedure.input(z.object({ projectId: z.number(), title: z.string().min(1), sortOrder: z.number().default(0), status: z.enum(["pending", "in_progress", "completed"]).default("pending"), progress: z.number().min(0).max(100).default(0) })).mutation(async ({ input, ctx }) => { const result = await createMilestone(input); await logProjectActivity(input.projectId, ctx.user.id, "milestone_added", `Milestone “${input.title}” added.`); return result; }),
      update: adminProcedure.input(z.object({ id: z.number(), projectId: z.number(), title: z.string().optional(), sortOrder: z.number().optional(), status: z.enum(["pending", "in_progress", "completed"]).optional(), progress: z.number().min(0).max(100).optional() })).mutation(async ({ input, ctx }) => { const { id, projectId, ...changes } = input; const patch: typeof changes & { completedAt?: Date | null } = { ...changes }; if (changes.status === "completed") patch.completedAt = new Date(); const result = await updateMilestone(id, patch); if (changes.status === "completed") await logProjectActivity(projectId, ctx.user.id, "milestone_completed", `Milestone completed.`); return result; }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteMilestone(input.id)),
    }),
    deliverables: router({
      list: adminProcedure.input(z.object({ projectId: z.number() })).query(({ input }) => getDeliverablesForProject(input.projectId)),
      all: adminProcedure.query(() => getAllDeliverables()),
      create: adminProcedure.input(z.object({ projectId: z.number(), milestoneId: z.number().optional(), title: z.string().min(1), sortOrder: z.number().default(0), status: z.enum(["pending", "in_progress", "awaiting_approval", "changes_requested", "completed"]).default("pending") })).mutation(async ({ input, ctx }) => { const result = await createDeliverable(input); await logProjectActivity(input.projectId, ctx.user.id, "deliverable_added", `Deliverable “${input.title}” added.`); return result; }),
      update: adminProcedure.input(z.object({ id: z.number(), projectId: z.number(), title: z.string().optional(), sortOrder: z.number().optional(), status: z.enum(["pending", "in_progress", "awaiting_approval", "changes_requested", "completed"]).optional() })).mutation(async ({ input, ctx }) => { const { id, projectId, ...changes } = input; const result = await updateDeliverable(id, changes); if (changes.status === "awaiting_approval") { await logProjectActivity(projectId, ctx.user.id, "review_requested", "Deliverable submitted for client review."); const project = await getProjectById(projectId); if (project?.clientId) await createNotification({ userId: project.clientId, type: "deliverable", title: "A deliverable is ready for review", body: "Please review and approve, or request changes.", href: `/portal/projects/${projectId}` }); } return result; }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteDeliverable(input.id)),
    }),
    agreements: router({
      all: adminProcedure.query(() => getAllAgreements()),
      byProject: adminProcedure.input(z.object({ projectId: z.number() })).query(({ input }) => getAgreementByProject(input.projectId)),
      create: adminProcedure.input(z.object({ projectId: z.number(), clientId: z.number() })).mutation(async ({ input }) => { const id = await createAgreement({ ...input, status: "draft" }); await logProjectActivity(input.projectId, null, "agreement_created", "Agreement drafted."); return { success: true, id }; }),
      update: adminProcedure.input(z.object({ id: z.number(), scope: z.string().optional(), timeline: z.string().optional(), cost: z.string().optional(), revisions: z.string().optional(), additionalWork: z.string().optional(), cancellation: z.string().optional(), ipOwnership: z.string().optional(), terms: z.string().optional() })).mutation(({ input }) => { const { id, ...changes } = input; return updateAgreement(id, changes); }),
      send: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { const agreement = await getAgreementById(input.id); if (!agreement) throw new TRPCError({ code: "NOT_FOUND", message: "Agreement not found." }); await updateAgreement(input.id, { status: "sent" }); await logProjectActivity(agreement.projectId, null, "agreement_sent", "Agreement sent to client for signature."); await createNotification({ userId: agreement.clientId, type: "agreement", title: "Your agreement is ready", body: "Review and sign your project agreement.", href: `/portal/projects/${agreement.projectId}` }); return { success: true }; }),
    }),
    clients: router({
      list: adminProcedure.query(() => getAllClients()),
      detail: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => { const client = await getUserById(input.id); if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found." }); const [projects, notes, requests, meetings] = await Promise.all([getProjectsForUser(input.id), getClientNotes(input.id), getRequestsForUser(input.id), getMeetingsForUser(input.id)]); return { client, projects, notes, requests, meetings }; }),
      updateStatus: adminProcedure.input(z.object({ id: z.number(), status: z.enum(["lead", "active", "inactive"]) })).mutation(({ input }) => updateClient(input.id, { status: input.status })),
      addNote: adminProcedure.input(z.object({ clientId: z.number(), body: z.string().min(1) })).mutation(({ input, ctx }) => createClientNote({ clientId: input.clientId, authorId: ctx.user.id, body: input.body })),
      deleteNote: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteClientNote(input.id)),
    }),
    changeRequests: router({
      all: adminProcedure.query(() => getAllChangeRequests()),
      updateStatus: adminProcedure.input(z.object({ id: z.number(), status: z.enum(["open", "in_progress", "resolved", "closed"]) })).mutation(async ({ input, ctx }) => { const result = await updateChangeRequestStatus(input.id, input.status); await createChangeRequestActivity({ changeRequestId: input.id, actorId: ctx.user.id, eventType: "status_changed", body: `Status changed to ${input.status.replace("_", " ")}.` }); return result; }),
    }),
    meetingSlots: router({
      all: adminProcedure.query(() => getAllMeetingSlots()),
      create: adminProcedure.input(z.object({ startTime: z.coerce.date(), durationMinutes: z.number().default(30) })).mutation(({ input }) => createMeetingSlot({ ...input, status: "available" })),
      update: adminProcedure.input(z.object({ id: z.number(), startTime: z.coerce.date().optional(), durationMinutes: z.number().optional(), status: z.enum(["available", "disabled", "booked"]).optional() })).mutation(({ input }) => { const { id, ...changes } = input; return updateMeetingSlot(id, changes); }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteMeetingSlot(input.id)),
    }),
    bookings: router({ all: adminProcedure.query(() => getAllMeetings()) }),
    experience: router({
      all: adminProcedure.query(() => getAllExperience()),
      create: adminProcedure.input(z.object({ title: z.string().min(1), organization: z.string().min(1), type: z.string().optional(), startDate: z.coerce.date().optional(), endDate: z.coerce.date().optional(), description: z.string().optional(), logoUrl: z.string().optional(), skills: z.string().optional(), isCurrent: z.boolean().default(false), isFeatured: z.boolean().default(false), isPublic: z.boolean().default(true), sortOrder: z.number().default(0) })).mutation(({ input }) => createExperience(input)),
      update: adminProcedure.input(z.object({ id: z.number(), title: z.string().optional(), organization: z.string().optional(), type: z.string().optional(), startDate: z.coerce.date().optional(), endDate: z.coerce.date().optional(), description: z.string().optional(), logoUrl: z.string().optional(), skills: z.string().optional(), isCurrent: z.boolean().optional(), isFeatured: z.boolean().optional(), isPublic: z.boolean().optional(), sortOrder: z.number().optional() })).mutation(({ input }) => { const { id, ...changes } = input; return updateExperience(id, changes); }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteExperience(input.id)),
    }),
    skills: router({
      all: adminProcedure.query(() => getAllSkills()),
      create: adminProcedure.input(z.object({ name: z.string().min(1), category: z.string().optional(), icon: z.string().optional(), sortOrder: z.number().default(0), isPublic: z.boolean().default(true) })).mutation(({ input }) => createSkill(input)),
      update: adminProcedure.input(z.object({ id: z.number(), name: z.string().optional(), category: z.string().optional(), icon: z.string().optional(), sortOrder: z.number().optional(), isPublic: z.boolean().optional() })).mutation(({ input }) => { const { id, ...changes } = input; return updateSkill(id, changes); }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteSkill(input.id)),
    }),
    about: router({
      get: adminProcedure.query(() => getAboutProfile()),
      update: adminProcedure.input(z.object({ name: z.string().optional(), headline: z.string().optional(), bio: z.string().optional(), profileImageUrl: z.string().optional(), email: z.string().optional(), location: z.string().optional(), socialLinks: z.string().optional(), careerFocus: z.string().optional() })).mutation(({ input }) => upsertAboutProfile(input)),
    }),
    services: router({
      all: adminProcedure.query(() => getAllServices()),
      create: adminProcedure.input(z.object({ title: z.string().min(1), description: z.string().min(1), shortDescription: z.string().optional(), icon: z.string().optional(), startingPrice: z.string().optional(), features: z.string().optional(), isFeatured: z.boolean().default(false), isActive: z.boolean().default(true), sortOrder: z.number().default(0) })).mutation(({ input }) => createService(input)),
      update: adminProcedure.input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), shortDescription: z.string().optional(), icon: z.string().optional(), startingPrice: z.string().optional(), features: z.string().optional(), isFeatured: z.boolean().optional(), isActive: z.boolean().optional(), sortOrder: z.number().optional() })).mutation(({ input }) => { const { id, ...changes } = input; return updateService(id, changes); }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteService(input.id)),
    }),
    certificates: router({
      all: adminProcedure.query(() => getAllCertificates()),
      create: adminProcedure.input(z.object({ title: z.string().min(1), issuer: z.string().min(1), issueYear: z.number().optional(), credentialId: z.string().optional(), imageUrl: z.string().optional(), verifyUrl: z.string().optional(), description: z.string().optional(), isFeatured: z.boolean().default(false), isPublic: z.boolean().default(true) })).mutation(({ input }) => createCertificate(input)),
      update: adminProcedure.input(z.object({ id: z.number(), title: z.string().optional(), issuer: z.string().optional(), issueYear: z.number().optional(), credentialId: z.string().optional(), imageUrl: z.string().optional(), verifyUrl: z.string().optional(), description: z.string().optional(), isFeatured: z.boolean().optional(), isPublic: z.boolean().optional() })).mutation(({ input }) => { const { id, ...changes } = input; return updateCertificate(id, changes); }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteCertificate(input.id)),
    }),
    testimonials: router({
      all: adminProcedure.query(() => getAllTestimonials()),
      create: adminProcedure.input(z.object({ clientName: z.string().min(1), clientRole: z.string().optional(), company: z.string().optional(), clientImageUrl: z.string().optional(), quote: z.string().min(1), rating: z.number().min(1).max(5).optional(), relatedProjectId: z.number().optional(), isFeatured: z.boolean().default(false), isApproved: z.boolean().default(false) })).mutation(({ input }) => createTestimonial(input)),
      update: adminProcedure.input(z.object({ id: z.number(), clientName: z.string().optional(), clientRole: z.string().optional(), company: z.string().optional(), clientImageUrl: z.string().optional(), quote: z.string().optional(), rating: z.number().min(1).max(5).optional(), relatedProjectId: z.number().optional(), isFeatured: z.boolean().optional(), isApproved: z.boolean().optional() })).mutation(({ input }) => { const { id, ...changes } = input; return updateTestimonial(id, changes); }),
      delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteTestimonial(input.id)),
    }),
  }),
});
export type AppRouter = typeof appRouter;
