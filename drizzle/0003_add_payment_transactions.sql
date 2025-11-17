-- Migración: Agregar tabla de transacciones de pago con Flow
-- Fecha: 2025-11-16
-- Descripción: Crea la tabla paymentTransactions para almacenar información de pagos procesados con Flow

CREATE TABLE IF NOT EXISTS `paymentTransactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orderId` INT NOT NULL,
  `flowToken` VARCHAR(255),
  `commerceOrder` VARCHAR(64) NOT NULL,
  `flowOrder` VARCHAR(64),
  `amount` INT NOT NULL,
  `status` ENUM('pending', 'completed', 'rejected', 'cancelled') DEFAULT 'pending' NOT NULL,
  `paymentMethod` VARCHAR(50),
  `paymentData` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_payment_transactions_order_id` (`orderId`),
  INDEX `idx_payment_transactions_flow_token` (`flowToken`),
  INDEX `idx_payment_transactions_commerce_order` (`commerceOrder`),
  FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
