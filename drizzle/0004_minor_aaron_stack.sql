CREATE TABLE `reservationItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reservationId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	CONSTRAINT `reservationItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `reservations` DROP COLUMN `productId`;--> statement-breakpoint
ALTER TABLE `reservations` DROP COLUMN `quantity`;