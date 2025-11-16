-- Migración para agregar autenticación local
-- Fecha: 2024-11-16

-- Agregar columnas para autenticación local
ALTER TABLE `users` 
  ADD COLUMN `username` VARCHAR(64) NULL UNIQUE AFTER `id`,
  ADD COLUMN `password` VARCHAR(255) NULL AFTER `email`,
  MODIFY COLUMN `openId` VARCHAR(64) NULL;

-- Crear índices para mejorar rendimiento de búsquedas
CREATE INDEX idx_users_username ON `users`(`username`);
CREATE INDEX idx_users_email ON `users`(`email`);

-- Nota: Los campos openId, username y email deben ser únicos solo si no son NULL
-- MySQL permite múltiples valores NULL en columnas UNIQUE
