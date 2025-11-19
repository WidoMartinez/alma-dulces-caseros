CREATE TABLE `paymentTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`flowToken` varchar(255),
	`commerceOrder` varchar(64) NOT NULL,
	`flowOrder` varchar(64),
	`amount` int NOT NULL,
	`status` enum('pending','completed','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`paymentData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `userId` int;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `deliveryAddress` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD `trackingNumber` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `customerEmail` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `customerName` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `customerPhone` varchar(20);--> statement-breakpoint
ALTER TABLE `orders` ADD `isGuest` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `deliveryAddress` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_trackingNumber_unique` UNIQUE(`trackingNumber`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);