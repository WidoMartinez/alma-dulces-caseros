-- Migración para añadir soporte de unidad completa a productos
-- Añade campos para permitir productos con opciones de porción y unidad completa

ALTER TABLE `products` ADD COLUMN `hasWholeOption` tinyint DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `wholePrice` int;
--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `wholeName` varchar(150);
--> statement-breakpoint
ALTER TABLE `orderItems` ADD COLUMN `isWholeUnit` tinyint DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `reservationItems` ADD COLUMN `isWholeUnit` tinyint DEFAULT 1 NOT NULL;
