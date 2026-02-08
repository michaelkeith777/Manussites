CREATE TABLE `prompt_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` text NOT NULL,
	`sport` varchar(32),
	`playerName` varchar(128),
	`team` varchar(128),
	`prompt` text NOT NULL,
	`enhancedPrompt` text,
	`artStyle` varchar(32),
	`model` enum('nano-banana','nano-banana-pro') NOT NULL DEFAULT 'nano-banana',
	`aspectRatio` varchar(16) NOT NULL DEFAULT '2:3',
	`usageCount` int NOT NULL DEFAULT 1,
	`lastUsedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prompt_history_id` PRIMARY KEY(`id`)
);
