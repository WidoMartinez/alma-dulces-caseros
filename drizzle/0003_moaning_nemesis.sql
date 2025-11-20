CREATE TABLE `blockedDates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`reason` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blockedDates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dispatchSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`availableDays` text NOT NULL,
	`startTime` varchar(5) NOT NULL DEFAULT '09:00',
	`endTime` varchar(5) NOT NULL DEFAULT '18:00',
	`minAdvanceDays` int NOT NULL DEFAULT 1,
	`maxAdvanceDays` int NOT NULL DEFAULT 30,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dispatchSettings_id` PRIMARY KEY(`id`)
);
