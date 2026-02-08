CREATE TABLE `generated_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskId` varchar(128) NOT NULL,
	`prompt` text NOT NULL,
	`enhancedPrompt` text,
	`originalTopic` text,
	`model` enum('nano-banana','nano-banana-pro') NOT NULL DEFAULT 'nano-banana',
	`aspectRatio` varchar(16) NOT NULL DEFAULT '1:1',
	`resolution` varchar(8) NOT NULL DEFAULT '1K',
	`imageUrl` text,
	`s3Key` varchar(512),
	`status` enum('pending','generating','completed','failed') NOT NULL DEFAULT 'pending',
	`failReason` text,
	`isFavorite` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `generated_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generation_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` text NOT NULL,
	`basePrompt` text NOT NULL,
	`enhancedPrompt` text,
	`model` enum('nano-banana','nano-banana-pro') NOT NULL DEFAULT 'nano-banana',
	`imageCount` int NOT NULL DEFAULT 1,
	`completedCount` int NOT NULL DEFAULT 0,
	`status` enum('pending','generating','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generation_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trending_topics_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topic` varchar(256) NOT NULL,
	`category` varchar(64) NOT NULL,
	`source` varchar(64) NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`metadata` json,
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `trending_topics_cache_id` PRIMARY KEY(`id`)
);
