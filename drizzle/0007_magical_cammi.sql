CREATE TABLE `card_backs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`imageUrl` text,
	`s3Key` varchar(512),
	`backgroundColor` varchar(16) DEFAULT '#1a1a2e',
	`pattern` varchar(32) DEFAULT 'solid',
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `card_backs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `card_collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`theme` varchar(64),
	`borderStyle` varchar(64) DEFAULT 'classic',
	`borderColor` varchar(16) DEFAULT '#gold',
	`maxCards` int DEFAULT 100,
	`cardCount` int NOT NULL DEFAULT 0,
	`cardBackId` int,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `card_collections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `card_decks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`cardBackId` int,
	`cardCount` int NOT NULL DEFAULT 0,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `card_decks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `card_signatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`imageId` int NOT NULL,
	`signatureText` varchar(256),
	`signatureImageUrl` text,
	`verificationCode` varchar(64) NOT NULL,
	`signedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `card_signatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deck_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deckId` int NOT NULL,
	`imageId` int NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`quantity` int NOT NULL DEFAULT 1,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deck_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `generated_images` ADD `rarity` enum('common','rare','epic','legendary') DEFAULT 'common';--> statement-breakpoint
ALTER TABLE `generated_images` ADD `cardStats` json;--> statement-breakpoint
ALTER TABLE `generated_images` ADD `collectionId` int;--> statement-breakpoint
ALTER TABLE `generated_images` ADD `cardNumber` int;--> statement-breakpoint
ALTER TABLE `generated_images` ADD `styleReferenceUrl` text;--> statement-breakpoint
ALTER TABLE `generated_images` ADD `signatureCode` varchar(64);