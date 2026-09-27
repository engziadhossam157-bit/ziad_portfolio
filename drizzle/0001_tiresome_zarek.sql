CREATE TABLE `aboutProfile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`headline` text,
	`bio` text,
	`profileImageUrl` text,
	`email` text,
	`location` text,
	`socialLinks` text,
	`careerFocus` text,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `agreements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectId` integer NOT NULL,
	`clientId` integer NOT NULL,
	`scope` text,
	`timeline` text,
	`cost` text,
	`revisions` text,
	`additionalWork` text,
	`cancellation` text,
	`ipOwnership` text,
	`terms` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`signedName` text,
	`signedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `clientNotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clientId` integer NOT NULL,
	`authorId` integer,
	`body` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `deliverables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectId` integer NOT NULL,
	`milestoneId` integer,
	`title` text NOT NULL,
	`sortOrder` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewNote` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `experience` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`organization` text NOT NULL,
	`type` text,
	`startDate` integer,
	`endDate` integer,
	`description` text,
	`logoUrl` text,
	`skills` text,
	`isCurrent` integer DEFAULT false NOT NULL,
	`isFeatured` integer DEFAULT false NOT NULL,
	`isPublic` integer DEFAULT true NOT NULL,
	`sortOrder` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meetingSlots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`startTime` integer NOT NULL,
	`durationMinutes` integer DEFAULT 30 NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectId` integer NOT NULL,
	`title` text NOT NULL,
	`sortOrder` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`completedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projectActivity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`projectId` integer NOT NULL,
	`actorId` integer,
	`eventType` text NOT NULL,
	`body` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text,
	`icon` text,
	`sortOrder` integer DEFAULT 0 NOT NULL,
	`isPublic` integer DEFAULT true NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
DROP INDEX "projects_slug_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "users_googleId_unique";--> statement-breakpoint
ALTER TABLE `meetings` ALTER COLUMN "clientId" TO "clientId" integer;--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_googleId_unique` ON `users` (`googleId`);--> statement-breakpoint
ALTER TABLE `meetings` ADD `slotId` integer;--> statement-breakpoint
ALTER TABLE `meetings` ADD `guestName` text;--> statement-breakpoint
ALTER TABLE `meetings` ADD `guestEmail` text;--> statement-breakpoint
ALTER TABLE `meetings` ADD `guestPhone` text;--> statement-breakpoint
ALTER TABLE `attachments` ADD `milestoneId` integer;--> statement-breakpoint
ALTER TABLE `attachments` ADD `deliverableId` integer;--> statement-breakpoint
ALTER TABLE `certificates` ADD `description` text;--> statement-breakpoint
ALTER TABLE `certificates` ADD `isFeatured` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `certificates` ADD `isPublic` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `isPublic` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `startDate` integer;--> statement-breakpoint
ALTER TABLE `services` ADD `shortDescription` text;--> statement-breakpoint
ALTER TABLE `services` ADD `startingPrice` text;--> statement-breakpoint
ALTER TABLE `services` ADD `features` text;--> statement-breakpoint
ALTER TABLE `services` ADD `isFeatured` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `testimonials` ADD `company` text;--> statement-breakpoint
ALTER TABLE `testimonials` ADD `rating` integer;--> statement-breakpoint
ALTER TABLE `testimonials` ADD `relatedProjectId` integer;--> statement-breakpoint
ALTER TABLE `testimonials` ADD `isFeatured` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `address` text;--> statement-breakpoint
ALTER TABLE `users` ADD `status` text DEFAULT 'active' NOT NULL;