import { and, asc, desc, eq, gt, inArray } from "drizzle-orm";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { ENV } from "./_core/env";
import {
  aboutProfile, agreements, attachments, certificates, changeRequestActivity, changeRequests,
  clientNotes, deliverables, experience, meetings, meetingSlots, messages, milestones,
  notifications, projectActivity, projectRequests, projects, services, skills, testimonials, users,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() { if (!_db && ENV.tursoUrl) { try { const client = createClient({ url: ENV.tursoUrl, authToken: ENV.tursoAuthToken || undefined }); _db = drizzle(client); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; } } return _db; }

function roleForEmail(email: string): "admin" | "user" { return ENV.ownerEmail && email.toLowerCase() === ENV.ownerEmail ? "admin" : "user"; }
export async function getUserById(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(users).where(eq(users.id, id)).limit(1); return rows[0]; }
export async function getUserByEmail(email: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1); return rows[0]; }
export async function getUserByGoogleId(googleId: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1); return rows[0]; }
export async function createUserWithPassword(input: { email: string; passwordHash: string; name: string | null }): Promise<number> { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const email = input.email.toLowerCase(); const result = await db.insert(users).values({ email, passwordHash: input.passwordHash, name: input.name, loginMethod: "password", role: roleForEmail(email), lastSignedIn: new Date() }); return Number(result.lastInsertRowid); }
export async function upsertGoogleUser(input: { email: string; googleId: string; name: string | null }): Promise<number> { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const email = input.email.toLowerCase(); const existingByGoogle = await getUserByGoogleId(input.googleId); if (existingByGoogle) { await db.update(users).set({ name: input.name ?? existingByGoogle.name, lastSignedIn: new Date() }).where(eq(users.id, existingByGoogle.id)); return existingByGoogle.id; } const existingByEmail = await getUserByEmail(email); if (existingByEmail) { await db.update(users).set({ googleId: input.googleId, loginMethod: existingByEmail.passwordHash ? "both" : "google", lastSignedIn: new Date() }).where(eq(users.id, existingByEmail.id)); return existingByEmail.id; } const result = await db.insert(users).values({ email, googleId: input.googleId, name: input.name, loginMethod: "google", role: roleForEmail(email), lastSignedIn: new Date() }); return Number(result.lastInsertRowid); }
export async function touchLastSignedIn(id: number): Promise<void> { const db = await getDb(); if (!db) return; await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id)); }
export async function createClientUser(input: { email: string; name: string | null; phone?: string | null; company?: string | null }): Promise<number> { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const email = input.email.toLowerCase(); const result = await db.insert(users).values({ email, name: input.name, phone: input.phone ?? null, company: input.company ?? null, loginMethod: "pending", role: "user", status: "active", lastSignedIn: new Date() }); return Number(result.lastInsertRowid); }
export async function claimPendingAccount(id: number, input: { passwordHash: string; name: string }): Promise<void> { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(users).set({ passwordHash: input.passwordHash, name: input.name, loginMethod: "password", lastSignedIn: new Date() }).where(eq(users.id, id)); }
export async function getAdminUserIds(): Promise<number[]> { const db = await getDb(); if (!db) return []; const rows = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")); return rows.map(r => r.id); }

export async function getPublicPortfolio() { const db = await getDb(); if (!db) return { projects: [], services: [], certificates: [], testimonials: [] }; const [projectRows, serviceRows, certificateRows, testimonialRows] = await Promise.all([db.select().from(projects).where(and(eq(projects.isFeatured, true), eq(projects.isPublic, true))).orderBy(desc(projects.year)), db.select().from(services).where(eq(services.isActive, true)).orderBy(services.sortOrder), db.select().from(certificates).where(eq(certificates.isPublic, true)).orderBy(desc(certificates.issueYear)), db.select().from(testimonials).where(eq(testimonials.isApproved, true)).orderBy(desc(testimonials.createdAt))]); return { projects: projectRows, services: serviceRows, certificates: certificateRows, testimonials: testimonialRows }; }
export async function getAllPublicProjects() { const db = await getDb(); if (!db) return []; return db.select().from(projects).where(eq(projects.isPublic, true)).orderBy(desc(projects.year)); }
export async function createProjectRequest(input: typeof projectRequests.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(projectRequests).values(input); return Number(result.lastInsertRowid); }
export async function getRequestsForAdmin() { const db = await getDb(); if (!db) return []; return db.select().from(projectRequests).orderBy(desc(projectRequests.createdAt)); }
export async function getProjectsForUser(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(projects).where(eq(projects.clientId, userId)).orderBy(desc(projects.updatedAt)); }
export async function getProjectById(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1); return rows[0]; }
export async function getRequestsForUser(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(projectRequests).where(eq(projectRequests.userId, userId)).orderBy(desc(projectRequests.createdAt)); }
export async function getMessagesForUser(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(messages).where(inArray(messages.senderId, [userId])).orderBy(desc(messages.createdAt)); }
export async function getMessagesForProject(projectId: number) { const db = await getDb(); if (!db) return []; return db.select().from(messages).where(eq(messages.projectId, projectId)).orderBy(asc(messages.createdAt)); }
export async function getMeetingsForUser(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(meetings).where(eq(meetings.clientId, userId)).orderBy(meetings.scheduledAt); }
export async function getNotificationsForUser(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)); }
export async function markNotificationRead(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)); }
export async function createChangeRequest(input: typeof changeRequests.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(changeRequests).values(input); }
export async function getChangeRequestsForUser(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(changeRequests).where(eq(changeRequests.userId, userId)).orderBy(desc(changeRequests.updatedAt)); }
export async function getAllChangeRequests() { const db = await getDb(); if (!db) return []; return db.select().from(changeRequests).orderBy(desc(changeRequests.updatedAt)); }
export async function updateChangeRequestStatus(id: number, status: typeof changeRequests.$inferInsert.status) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(changeRequests).set({ status }).where(eq(changeRequests.id, id)); }
export async function createChangeRequestActivity(input: typeof changeRequestActivity.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(changeRequestActivity).values(input); }
export async function getChangeRequestActivityForUser(userId: number) { const db = await getDb(); if (!db) return []; return db.select({ activity: changeRequestActivity, request: changeRequests }).from(changeRequestActivity).innerJoin(changeRequests, eq(changeRequestActivity.changeRequestId, changeRequests.id)).where(eq(changeRequests.userId, userId)).orderBy(desc(changeRequestActivity.createdAt)); }
export async function createMessage(input: typeof messages.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(messages).values(input); }
export async function getAllMessagesWithProject() { const db = await getDb(); if (!db) return []; return db.select({ message: messages, project: projects }).from(messages).leftJoin(projects, eq(messages.projectId, projects.id)).orderBy(desc(messages.createdAt)); }
export async function updateUserProfile(id: number, input: Partial<Pick<typeof users.$inferInsert, "name" | "phone" | "company" | "address">>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(users).set(input).where(eq(users.id, id)); }
export async function createNotification(input: typeof notifications.$inferInsert) { const db = await getDb(); if (!db) return; return db.insert(notifications).values(input); }
export async function createAttachment(input: typeof attachments.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(attachments).values(input); }
export async function getAttachmentsForProject(projectId: number) { const db = await getDb(); if (!db) return []; return db.select().from(attachments).where(eq(attachments.projectId, projectId)).orderBy(desc(attachments.createdAt)); }
export async function updateRequestStatus(id: number, status: typeof projectRequests.$inferInsert.status) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(projectRequests).set({ status }).where(eq(projectRequests.id, id)); }
export async function createProject(input: typeof projects.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(projects).values(input); return Number(result.lastInsertRowid); }
export async function updateProject(id: number, input: Partial<typeof projects.$inferInsert>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(projects).set(input).where(eq(projects.id, id)); }
export async function deleteProject(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.delete(projects).where(eq(projects.id, id)); }
export async function getAllProjects() { const db = await getDb(); if (!db) return []; return db.select().from(projects).orderBy(desc(projects.createdAt)); }
export async function getDashboardCounts() { const db = await getDb(); if (!db) return { projects: 0, newRequests: 0, openChanges: 0, unreadMessages: 0, pendingAgreements: 0, upcomingMeetings: 0, awaitingApprovals: 0, clients: 0 }; const [allProjects, newRequests, openChanges, unreadMessages, pendingAgreements, upcomingMeetings, awaitingApprovals, clientRows] = await Promise.all([db.select({ id: projects.id }).from(projects), db.select({ id: projectRequests.id }).from(projectRequests).where(eq(projectRequests.status, "new")), db.select({ id: changeRequests.id }).from(changeRequests).where(inArray(changeRequests.status, ["open", "in_progress"])), db.select({ id: messages.id }).from(messages).where(eq(messages.isRead, false)), db.select({ id: agreements.id }).from(agreements).where(eq(agreements.status, "sent")), db.select({ id: meetings.id }).from(meetings).where(eq(meetings.status, "scheduled")), db.select({ id: deliverables.id }).from(deliverables).where(eq(deliverables.status, "awaiting_approval")), db.select({ id: users.id }).from(users).where(eq(users.role, "user"))]); return { projects: allProjects.length, newRequests: newRequests.length, openChanges: openChanges.length, unreadMessages: unreadMessages.length, pendingAgreements: pendingAgreements.length, upcomingMeetings: upcomingMeetings.length, awaitingApprovals: awaitingApprovals.length, clients: clientRows.length }; }

// Project activity timeline
export async function logProjectActivity(projectId: number, actorId: number | null, eventType: string, body: string) { const db = await getDb(); if (!db) return; return db.insert(projectActivity).values({ projectId, actorId, eventType, body }); }
export async function getProjectActivity(projectId: number) { const db = await getDb(); if (!db) return []; return db.select().from(projectActivity).where(eq(projectActivity.projectId, projectId)).orderBy(desc(projectActivity.createdAt)); }

// Milestones
export async function createMilestone(input: typeof milestones.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(milestones).values(input); }
export async function updateMilestone(id: number, input: Partial<typeof milestones.$inferInsert>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(milestones).set(input).where(eq(milestones.id, id)); }
export async function deleteMilestone(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.delete(milestones).where(eq(milestones.id, id)); }
export async function getMilestonesForProject(projectId: number) { const db = await getDb(); if (!db) return []; return db.select().from(milestones).where(eq(milestones.projectId, projectId)).orderBy(asc(milestones.sortOrder)); }
export async function getAllMilestones() { const db = await getDb(); if (!db) return []; return db.select({ milestone: milestones, project: projects }).from(milestones).innerJoin(projects, eq(milestones.projectId, projects.id)).orderBy(desc(milestones.updatedAt)); }
export async function getMilestoneById(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(milestones).where(eq(milestones.id, id)).limit(1); return rows[0]; }

// Deliverables
export async function createDeliverable(input: typeof deliverables.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(deliverables).values(input); }
export async function updateDeliverable(id: number, input: Partial<typeof deliverables.$inferInsert>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(deliverables).set(input).where(eq(deliverables.id, id)); }
export async function deleteDeliverable(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.delete(deliverables).where(eq(deliverables.id, id)); }
export async function getDeliverablesForProject(projectId: number) { const db = await getDb(); if (!db) return []; return db.select().from(deliverables).where(eq(deliverables.projectId, projectId)).orderBy(asc(deliverables.sortOrder)); }
export async function getAllDeliverables() { const db = await getDb(); if (!db) return []; return db.select({ deliverable: deliverables, project: projects }).from(deliverables).innerJoin(projects, eq(deliverables.projectId, projects.id)).orderBy(desc(deliverables.updatedAt)); }
export async function getDeliverableById(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(deliverables).where(eq(deliverables.id, id)).limit(1); return rows[0]; }

// Agreements
export async function createAgreement(input: typeof agreements.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(agreements).values(input); return Number(result.lastInsertRowid); }
export async function updateAgreement(id: number, input: Partial<typeof agreements.$inferInsert>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(agreements).set(input).where(eq(agreements.id, id)); }
export async function getAgreementByProject(projectId: number) { const db = await getDb(); if (!db) return null; const rows = await db.select().from(agreements).where(eq(agreements.projectId, projectId)).limit(1); return rows[0] ?? null; }
export async function getAgreementById(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(agreements).where(eq(agreements.id, id)).limit(1); return rows[0]; }
export async function getAllAgreements() { const db = await getDb(); if (!db) return []; return db.select({ agreement: agreements, project: projects }).from(agreements).innerJoin(projects, eq(agreements.projectId, projects.id)).orderBy(desc(agreements.updatedAt)); }

// Meeting slots + bookings
export async function createMeetingSlot(input: typeof meetingSlots.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(meetingSlots).values(input); }
export async function updateMeetingSlot(id: number, input: Partial<typeof meetingSlots.$inferInsert>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(meetingSlots).set(input).where(eq(meetingSlots.id, id)); }
export async function deleteMeetingSlot(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.delete(meetingSlots).where(eq(meetingSlots.id, id)); }
export async function getAllMeetingSlots() { const db = await getDb(); if (!db) return []; return db.select().from(meetingSlots).orderBy(asc(meetingSlots.startTime)); }
export async function getAvailableMeetingSlots() { const db = await getDb(); if (!db) return []; return db.select().from(meetingSlots).where(and(eq(meetingSlots.status, "available"), gt(meetingSlots.startTime, new Date()))).orderBy(asc(meetingSlots.startTime)); }
export async function getMeetingSlotById(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(meetingSlots).where(eq(meetingSlots.id, id)).limit(1); return rows[0]; }
export async function createMeeting(input: typeof meetings.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const result = await db.insert(meetings).values(input); return Number(result.lastInsertRowid); }
export async function getAllMeetings() { const db = await getDb(); if (!db) return []; return db.select().from(meetings).orderBy(desc(meetings.scheduledAt)); }
export async function updateMeeting(id: number, input: Partial<typeof meetings.$inferInsert>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(meetings).set(input).where(eq(meetings.id, id)); }

// Experience
export async function createExperience(input: typeof experience.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(experience).values(input); }
export async function updateExperience(id: number, input: Partial<typeof experience.$inferInsert>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(experience).set(input).where(eq(experience.id, id)); }
export async function deleteExperience(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.delete(experience).where(eq(experience.id, id)); }
export async function getAllExperience() { const db = await getDb(); if (!db) return []; return db.select().from(experience).orderBy(asc(experience.sortOrder)); }
export async function getPublicExperience() { const db = await getDb(); if (!db) return []; return db.select().from(experience).where(eq(experience.isPublic, true)).orderBy(asc(experience.sortOrder)); }

// Skills
export async function createSkill(input: typeof skills.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(skills).values(input); }
export async function updateSkill(id: number, input: Partial<typeof skills.$inferInsert>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(skills).set(input).where(eq(skills.id, id)); }
export async function deleteSkill(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.delete(skills).where(eq(skills.id, id)); }
export async function getAllSkills() { const db = await getDb(); if (!db) return []; return db.select().from(skills).orderBy(asc(skills.sortOrder)); }
export async function getPublicSkills() { const db = await getDb(); if (!db) return []; return db.select().from(skills).where(eq(skills.isPublic, true)).orderBy(asc(skills.sortOrder)); }

// About / profile (singleton row id=1)
export async function getAboutProfile() { const db = await getDb(); if (!db) return null; const rows = await db.select().from(aboutProfile).limit(1); return rows[0] ?? null; }
export async function upsertAboutProfile(input: Partial<typeof aboutProfile.$inferInsert>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const existing = await getAboutProfile(); if (existing) return db.update(aboutProfile).set(input).where(eq(aboutProfile.id, existing.id)); return db.insert(aboutProfile).values(input); }

// Client management
export async function getAllClients() { const db = await getDb(); if (!db) return []; return db.select().from(users).where(eq(users.role, "user")).orderBy(desc(users.createdAt)); }
export async function updateClient(id: number, input: Partial<typeof users.$inferInsert>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(users).set(input).where(eq(users.id, id)); }
export async function createClientNote(input: typeof clientNotes.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(clientNotes).values(input); }
export async function getClientNotes(clientId: number) { const db = await getDb(); if (!db) return []; return db.select().from(clientNotes).where(eq(clientNotes.clientId, clientId)).orderBy(desc(clientNotes.createdAt)); }
export async function deleteClientNote(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.delete(clientNotes).where(eq(clientNotes.id, id)); }

// Portfolio content admin CRUD
export async function createService(input: typeof services.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(services).values(input); }
export async function updateService(id: number, input: Partial<typeof services.$inferInsert>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(services).set(input).where(eq(services.id, id)); }
export async function deleteService(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.delete(services).where(eq(services.id, id)); }
export async function getAllServices() { const db = await getDb(); if (!db) return []; return db.select().from(services).orderBy(asc(services.sortOrder)); }

export async function createCertificate(input: typeof certificates.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(certificates).values(input); }
export async function updateCertificate(id: number, input: Partial<typeof certificates.$inferInsert>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(certificates).set(input).where(eq(certificates.id, id)); }
export async function deleteCertificate(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.delete(certificates).where(eq(certificates.id, id)); }
export async function getAllCertificates() { const db = await getDb(); if (!db) return []; return db.select().from(certificates).orderBy(desc(certificates.issueYear)); }

export async function createTestimonial(input: typeof testimonials.$inferInsert) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(testimonials).values(input); }
export async function updateTestimonial(id: number, input: Partial<typeof testimonials.$inferInsert>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(testimonials).set(input).where(eq(testimonials.id, id)); }
export async function deleteTestimonial(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.delete(testimonials).where(eq(testimonials.id, id)); }
export async function getAllTestimonials() { const db = await getDb(); if (!db) return []; return db.select().from(testimonials).orderBy(desc(testimonials.createdAt)); }
