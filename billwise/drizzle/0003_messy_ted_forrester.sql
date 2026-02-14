CREATE TABLE `billAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`billId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`url` text NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `billAttachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationPrefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enableReminders` boolean NOT NULL DEFAULT true,
	`reminderDaysBefore` int NOT NULL DEFAULT 3,
	`enableOverdueAlerts` boolean NOT NULL DEFAULT true,
	`lastNotifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPrefs_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationPrefs_userId_unique` UNIQUE(`userId`)
);
