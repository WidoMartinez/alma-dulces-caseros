-- Migración para agregar sistema de registro de clientes y seguimiento de pedidos
-- Fecha: 16 de Noviembre, 2024

-- 1. Agregar campos adicionales a la tabla users para información de clientes
ALTER TABLE `users` 
  ADD COLUMN `deliveryAddress` TEXT NULL AFTER `role`,
  ADD COLUMN `phone` VARCHAR(20) NULL AFTER `deliveryAddress`;

-- 2. Modificar la tabla orders para soportar compras de invitados y seguimiento
ALTER TABLE `orders`
  -- Hacer userId nullable para permitir compras de invitados
  MODIFY COLUMN `userId` INT NULL,
  
  -- Agregar número de seguimiento único
  ADD COLUMN `trackingNumber` VARCHAR(32) NOT NULL UNIQUE AFTER `userId`,
  
  -- Agregar información del cliente para invitados
  ADD COLUMN `customerEmail` VARCHAR(320) NOT NULL AFTER `trackingNumber`,
  ADD COLUMN `customerName` VARCHAR(255) NOT NULL AFTER `customerEmail`,
  ADD COLUMN `customerPhone` VARCHAR(20) NULL AFTER `customerName`,
  
  -- Indicador de compra como invitado
  ADD COLUMN `isGuest` INT NOT NULL DEFAULT 0 AFTER `customerPhone`,
  
  -- Hacer deliveryAddress obligatorio
  MODIFY COLUMN `deliveryAddress` TEXT NOT NULL;

-- 3. Crear índices para mejorar el rendimiento
CREATE INDEX idx_orders_tracking_number ON `orders`(`trackingNumber`);
CREATE INDEX idx_orders_customer_email ON `orders`(`customerEmail`);
CREATE INDEX idx_users_phone ON `users`(`phone`);

-- Nota: Esta migración debe ejecutarse antes de usar el nuevo sistema de registro y pedidos
