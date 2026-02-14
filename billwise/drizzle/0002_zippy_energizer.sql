CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`totalIncome` decimal(12,2) NOT NULL,
	`totalBills` decimal(12,2) NOT NULL,
	`totalSavings` decimal(12,2) NOT NULL,
	`suggestions` text,
	`breakdown` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incomes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`frequency` enum('weekly','biweekly','monthly','quarterly','yearly') NOT NULL DEFAULT 'monthly',
	`source` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incomes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `vaultPasscode` varchar(6);