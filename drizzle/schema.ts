import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Username para login local (único) */
  username: varchar("username", { length: 64 }).unique(),
  /** Email del usuario */
  email: varchar("email", { length: 320 }),
  /** Hash de la contraseña (bcrypt) */
  password: varchar("password", { length: 255 }),
  /** Identificador OAuth (legacy - ahora opcional) */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** Dirección de entrega predeterminada */
  deliveryAddress: text("deliveryAddress"),
  /** Teléfono de contacto */
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  ingredients: text("ingredients"),
  price: int("price").notNull(), // Price in cents (precio por porción/unidad)
  imageUrl: varchar("imageUrl", { length: 500 }),
  available: int("available").default(0).notNull(),
  organic: int("organic").default(1).notNull(),
  /** Indica si el producto tiene opción de unidad completa */
  hasWholeOption: int("hasWholeOption").default(0).notNull(),
  /** Precio de la unidad completa en centavos */
  wholePrice: int("wholePrice"),
  /** Nombre descriptivo para la unidad completa (ej: "Torta Completa") */
  wholeName: varchar("wholeName", { length: 150 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  /** ID de usuario (null para invitados) */
  userId: int("userId"),
  /** Número de seguimiento único para el pedido */
  trackingNumber: varchar("trackingNumber", { length: 32 }).unique().notNull(),
  /** Email para seguimiento (especialmente para invitados) */
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  /** Nombre del cliente */
  customerName: varchar("customerName", { length: 255 }).notNull(),
  /** Teléfono de contacto */
  customerPhone: varchar("customerPhone", { length: 20 }),
  /** Indica si es una compra como invitado */
  isGuest: int("isGuest").default(0).notNull(),
  totalPrice: int("totalPrice").notNull(), // Total in cents
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ])
    .default("pending")
    .notNull(),
  deliveryDate: timestamp("deliveryDate"),
  deliveryAddress: text("deliveryAddress").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  priceAtPurchase: int("priceAtPurchase").notNull(),
  /** Indica si el item es unidad completa (1) o porción (0) */
  isWholeUnit: int("isWholeUnit").default(0).notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reservedDate: timestamp("reservedDate").notNull(),
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "cancelled",
    "completed",
  ])
    .default("pending")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

export const reservationItems = mysqlTable("reservationItems", {
  id: int("id").autoincrement().primaryKey(),
  reservationId: int("reservationId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  /** Para reservas, siempre debe ser unidad completa (1) */
  isWholeUnit: int("isWholeUnit").default(1).notNull(),
});

export type ReservationItem = typeof reservationItems.$inferSelect;
export type InsertReservationItem = typeof reservationItems.$inferInsert;

/**
 * Tabla de transacciones de pago con Flow
 * Almacena información de pagos procesados a través de la pasarela Flow
 */
export const paymentTransactions = mysqlTable("paymentTransactions", {
  id: int("id").autoincrement().primaryKey(),
  /** ID del pedido asociado */
  orderId: int("orderId").notNull(),
  /** Token de Flow para identificar la transacción */
  flowToken: varchar("flowToken", { length: 255 }),
  /** ID de la orden de comercio (generado por nosotros) */
  commerceOrder: varchar("commerceOrder", { length: 64 }).notNull(),
  /** ID de la orden de Flow (retornado por Flow) */
  flowOrder: varchar("flowOrder", { length: 64 }),
  /** Monto de la transacción en centavos */
  amount: int("amount").notNull(),
  /** Estado de la transacción */
  status: mysqlEnum("status", ["pending", "completed", "rejected", "cancelled"])
    .default("pending")
    .notNull(),
  /** Método de pago utilizado (Webpay, Servipag, etc) */
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  /** Datos adicionales de la transacción en formato JSON */
  paymentData: text("paymentData"),
  /** Fecha de creación de la transacción */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Fecha de última actualización */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

/**
 * Tabla de configuración de días y horarios de despacho
 * Almacena la configuración global para disponibilidad de despachos
 */
export const dispatchSettings = mysqlTable("dispatchSettings", {
  id: int("id").autoincrement().primaryKey(),
  /** Días de la semana disponibles para despacho (JSON array: [0-6], 0=Domingo) */
  availableDays: text("availableDays").notNull(), // JSON: [1,2,3,4,5] = Lunes a Viernes
  /** Hora de inicio de despacho en formato HH:mm */
  startTime: varchar("startTime", { length: 5 }).notNull().default("09:00"),
  /** Hora de fin de despacho en formato HH:mm */
  endTime: varchar("endTime", { length: 5 }).notNull().default("18:00"),
  /** Días de anticipación mínima para reservar */
  minAdvanceDays: int("minAdvanceDays").notNull().default(1),
  /** Días de anticipación máxima para reservar */
  maxAdvanceDays: int("maxAdvanceDays").notNull().default(30),
  /** Fecha de creación */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Fecha de última actualización */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DispatchSettings = typeof dispatchSettings.$inferSelect;
export type InsertDispatchSettings = typeof dispatchSettings.$inferInsert;

/**
 * Tabla de fechas bloqueadas (feriados, días no laborables)
 * Permite bloquear fechas específicas para no permitir despachos
 */
export const blockedDates = mysqlTable("blockedDates", {
  id: int("id").autoincrement().primaryKey(),
  /** Fecha bloqueada */
  date: timestamp("date").notNull(),
  /** Razón del bloqueo (ej: "Feriado Nacional", "Vacaciones") */
  reason: varchar("reason", { length: 255 }).notNull(),
  /** Fecha de creación */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlockedDate = typeof blockedDates.$inferSelect;
export type InsertBlockedDate = typeof blockedDates.$inferInsert;
