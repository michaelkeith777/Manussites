CREATE TABLE `ad_creatives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`productImageUrl` text,
	`generatedImageUrl` text,
	`prompt` text,
	`headline` text,
	`primaryText` text,
	`callToAction` varchar(100),
	`format` enum('single','carousel','story','video_thumbnail','banner') NOT NULL DEFAULT 'single',
	`aspectRatio` varchar(10) DEFAULT '1:1',
	`platform` enum('meta','tiktok','google','snapchat','pinterest','all') DEFAULT 'all',
	`status` enum('pending','generating','completed','failed') NOT NULL DEFAULT 'pending',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ad_creatives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ad_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('ecommerce','saas','local','fashion','food','tech','general') NOT NULL DEFAULT 'general',
	`thumbnailUrl` text,
	`promptTemplate` text NOT NULL,
	`defaultHeadline` text,
	`defaultPrimaryText` text,
	`defaultCta` varchar(100),
	`aspectRatio` varchar(10) DEFAULT '1:1',
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`name` varchar(255) NOT NULL,
	`platform` enum('meta','tiktok','google','snapchat','pinterest') NOT NULL,
	`status` enum('draft','active','paused','completed','archived') NOT NULL DEFAULT 'draft',
	`objective` varchar(100),
	`budget` bigint,
	`spent` bigint DEFAULT 0,
	`impressions` bigint DEFAULT 0,
	`clicks` bigint DEFAULT 0,
	`conversions` int DEFAULT 0,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gallery` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`creativeId` int,
	`title` varchar(255),
	`imageUrl` text NOT NULL,
	`thumbnailUrl` text,
	`format` varchar(20),
	`width` int,
	`height` int,
	`fileSize` int,
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gallery_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`brandName` varchar(255),
	`brandUrl` text,
	`brandLogoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usage_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`creditsUsed` int NOT NULL DEFAULT 1,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usage_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `plan` enum('free','pro','agency','enterprise') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `creditsRemaining` int DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `creditsMonthly` int DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(255);