import { eq, or, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  InsertProduct,
  User,
  users,
  categories,
  products,
  orders,
  orderItems,
  reservations,
  reservationItems,
  paymentTransactions,
  InsertPaymentTransaction,
  PaymentTransaction,
  dispatchSettings,
  DispatchSettings,
  InsertDispatchSettings,
  blockedDates,
  BlockedDate,
  InsertBlockedDate,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _dbConnectionFailed = false;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (_dbConnectionFailed) {
    return null;
  }

  if (!_db && process.env.DATABASE_URL) {
    try {
      const mysql = await import("mysql2/promise");
      const connection = await mysql.default.createConnection(
        process.env.DATABASE_URL
      );
      await connection.ping();
      await connection.end();
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn(
        "[Database] Failed to connect, using mock data:",
        error instanceof Error ? error.message : error
      );
      _dbConnectionFailed = true;
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Obtiene un usuario por su ID
 */
export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Obtiene un usuario por username o email
 */
export async function getUserByUsernameOrEmail(
  usernameOrEmail: string
): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(
      or(eq(users.username, usernameOrEmail), eq(users.email, usernameOrEmail))
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(user: InsertUser): Promise<User> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(users).values(user);
    const insertId = Number(result[0].insertId);
    const createdUser = await getUserById(insertId);
    if (!createdUser) {
      throw new Error("Failed to retrieve created user");
    }
    return createdUser;
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
    throw error;
  }
}

/**
 * Actualiza la última conexión de un usuario
 */
export async function updateUserLastSignIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    await db
      .update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user last sign in:", error);
  }
}

/**
 * Actualiza la contraseña de un usuario
 */
export async function updateUserPassword(
  userId: number,
  passwordHash: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .update(users)
      .set({ password: passwordHash })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user password:", error);
    throw error;
  }
}

const mockProducts = [
  {
    id: 1,
    categoryId: 1,
    name: "Tarta de Frutos Rojos",
    description: "Deliciosa tarta con frutos rojos frescos y crema artesanal",
    ingredients: "Fresas, frambuesas, arándanos, crema, harina integral",
    price: 25000,
    imageUrl: null,
    available: 5,
    organic: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    categoryId: 1,
    name: "Tarta de Chocolate",
    description: "Tarta de chocolate belga con relleno cremoso",
    ingredients: "Chocolate 70%, crema, huevos, azúcar morena",
    price: 28000,
    imageUrl: null,
    available: 8,
    organic: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    categoryId: 2,
    name: "Galletas de Avena y Miel",
    description: "Galletas crujientes con avena y miel pura",
    ingredients: "Avena, miel, mantequilla, harina de trigo integral",
    price: 8000,
    imageUrl: null,
    available: 20,
    organic: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    categoryId: 2,
    name: "Galletas de Almendra",
    description: "Galletas delicadas con almendra molida",
    ingredients: "Almendra, huevo, azúcar de caña, vainilla",
    price: 9500,
    imageUrl: null,
    available: 15,
    organic: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    categoryId: 3,
    name: "Brownie de Chocolate Oscuro",
    description: "Brownie denso y jugoso de chocolate oscuro",
    ingredients: "Chocolate 85%, mantequilla, huevos, harina",
    price: 12000,
    imageUrl: null,
    available: 12,
    organic: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    categoryId: 3,
    name: "Brownie con Nueces",
    description: "Brownie con nueces de macadamia tostadas",
    ingredients: "Chocolate, nueces, mantequilla, huevos",
    price: 14000,
    imageUrl: null,
    available: 10,
    organic: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 7,
    categoryId: 4,
    name: "Mermelada de Fresa",
    description: "Mermelada casera de fresa sin conservantes",
    ingredients: "Fresas, azúcar de caña, limón",
    price: 7500,
    imageUrl: null,
    available: 25,
    organic: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 8,
    categoryId: 4,
    name: "Mermelada de Frambuesa",
    description: "Mermelada artesanal de frambuesa silvestre",
    ingredients: "Frambuesas, azúcar, limón",
    price: 8500,
    imageUrl: null,
    available: 18,
    organic: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockCategories = [
  {
    id: 1,
    name: "Tartas",
    description: "Tartas artesanales deliciosas",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Galletas",
    description: "Galletas crujientes y sabrosas",
    createdAt: new Date(),
  },
  {
    id: 3,
    name: "Brownies",
    description: "Brownies de chocolate intenso",
    createdAt: new Date(),
  },
  {
    id: 4,
    name: "Mermeladas",
    description: "Mermeladas caseras naturales",
    createdAt: new Date(),
  },
];

export async function getAllProducts() {
  const db = await getDb();
  if (!db) {
    return mockProducts;
  }

  try {
    return await db.select().from(products);
  } catch (error) {
    console.warn(
      "[Database] Query failed, using mock data:",
      error instanceof Error ? error.message : error
    );
    _dbConnectionFailed = true;
    _db = null;
    return mockProducts;
  }
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.categoryId, categoryId));
}

export async function getAllCategories() {
  const db = await getDb();
  if (!db) {
    return mockCategories;
  }

  try {
    return await db.select().from(categories);
  } catch (error) {
    console.warn(
      "[Database] Query failed, using mock data:",
      error instanceof Error ? error.message : error
    );
    _dbConnectionFailed = true;
    _db = null;
    return mockCategories;
  }
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getUserReservations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Obtener las reservas del usuario
  const userReservations = await db
    .select()
    .from(reservations)
    .where(eq(reservations.userId, userId));

  // Para cada reserva, obtener sus items con información del producto
  const reservationsWithItems = await Promise.all(
    userReservations.map(async reservation => {
      const items = await db
        .select()
        .from(reservationItems)
        .where(eq(reservationItems.reservationId, reservation.id));

      // Obtener información de cada producto
      const itemsWithProducts = await Promise.all(
        items.map(async item => {
          const product = await getProductById(item.productId);
          return {
            ...item,
            product: product
              ? {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl,
                }
              : null,
          };
        })
      );

      return {
        ...reservation,
        items: itemsWithProducts,
      };
    })
  );

  return reservationsWithItems;
}

/**
 * Crea una nueva reserva con múltiples items
 */
export async function createReservation(reservationData: {
  userId: number;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  reservedDate: Date;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Verificar que la fecha esté disponible para despacho
    const isAvailable = await isDateAvailableForDispatch(
      reservationData.reservedDate
    );
    if (!isAvailable) {
      throw new Error("La fecha seleccionada no está disponible para reservas");
    }

    // Validar que haya al menos un item
    if (!reservationData.items || reservationData.items.length === 0) {
      throw new Error("Debes agregar al menos un producto a la reserva");
    }

    // Crear la reserva principal
    const result = await db.insert(reservations).values({
      userId: reservationData.userId,
      reservedDate: reservationData.reservedDate,
      notes: reservationData.notes || null,
      status: "pending",
    });

    const reservationId = Number(result[0].insertId);

    // Insertar los items de la reserva
    const itemsToInsert = reservationData.items.map(item => ({
      reservationId,
      productId: item.productId,
      quantity: item.quantity,
    }));

    await db.insert(reservationItems).values(itemsToInsert);

    // Obtener la reserva creada con sus items
    const createdReservation = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .limit(1);

    if (createdReservation.length === 0) {
      throw new Error("Failed to retrieve created reservation");
    }

    return createdReservation[0];
  } catch (error) {
    console.error("[Database] Failed to create reservation:", error);
    throw error;
  }
}

// Admin CRUD operations for products
export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(products).values(product);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create product:", error);
    throw error;
  }
}

export async function updateProduct(
  id: number,
  product: Partial<InsertProduct>
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update product:", error);
    throw error;
  }
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.delete(products).where(eq(products.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete product:", error);
    throw error;
  }
}

// Funciones para órdenes y clientes

/**
 * Genera un número de seguimiento único para un pedido
 */
export function generateTrackingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ALMA-${timestamp}-${random}`;
}

/**
 * Crea un nuevo pedido (cliente registrado o invitado)
 */
export async function createOrder(orderData: {
  userId?: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  isGuest: boolean;
  totalPrice: number;
  deliveryAddress: string;
  deliveryDate?: Date;
  notes?: string;
  items: Array<{
    productId: number;
    quantity: number;
    priceAtPurchase: number;
  }>;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Generar número de seguimiento único
    const trackingNumber = generateTrackingNumber();

    // Crear la orden
    const orderResult = await db.insert(orders).values({
      userId: orderData.userId || null,
      trackingNumber,
      customerEmail: orderData.customerEmail,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone || null,
      isGuest: orderData.isGuest ? 1 : 0,
      totalPrice: orderData.totalPrice,
      deliveryAddress: orderData.deliveryAddress,
      deliveryDate: orderData.deliveryDate || null,
      notes: orderData.notes || null,
      status: "pending",
    });

    const orderId = Number(orderResult[0].insertId);

    // Crear los items de la orden
    if (orderData.items.length > 0) {
      await db.insert(orderItems).values(
        orderData.items.map(item => ({
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
        }))
      );
    }

    return { orderId, trackingNumber };
  } catch (error) {
    console.error("[Database] Failed to create order:", error);
    throw error;
  }
}

/**
 * Obtiene un pedido por su número de seguimiento
 */
export async function getOrderByTrackingNumber(trackingNumber: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.trackingNumber, trackingNumber))
      .limit(1);

    if (result.length === 0) return null;

    const order = result[0];

    // Obtener los items del pedido
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    return { ...order, items };
  } catch (error) {
    console.error("[Database] Failed to get order by tracking number:", error);
    throw error;
  }
}

/**
 * Obtiene todos los pedidos de un usuario
 */
export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId));

    // Obtener items para cada orden
    const ordersWithItems = await Promise.all(
      userOrders.map(async order => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    return ordersWithItems;
  } catch (error) {
    console.error("[Database] Failed to get orders by user:", error);
    throw error;
  }
}

/**
 * Obtiene todos los pedidos con sus items
 */
export async function getAllOrders() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const allOrders = await db.select().from(orders);

    // Obtener items para cada orden
    const ordersWithItems = await Promise.all(
      allOrders.map(async order => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        // Obtener información de usuario si existe
        let user = null;
        if (order.userId) {
          user = await getUserById(order.userId);
        }

        return {
          ...order,
          items,
          user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
              }
            : null,
        };
      })
    );

    return ordersWithItems;
  } catch (error) {
    console.error("[Database] Failed to get all orders:", error);
    throw error;
  }
}

/**
 * Actualiza el estado de un pedido
 */
export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
  } catch (error) {
    console.error("[Database] Failed to update order status:", error);
    throw error;
  }
}

/**
 * Registra un nuevo cliente
 */
export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  deliveryAddress?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(users).values({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      phone: userData.phone || null,
      deliveryAddress: userData.deliveryAddress || null,
      role: "user",
      loginMethod: "local",
    });

    const userId = Number(result[0].insertId);
    const user = await getUserById(userId);
    return user;
  } catch (error) {
    console.error("[Database] Failed to register user:", error);
    throw error;
  }
}

/**
 * Actualiza el perfil de un usuario
 */
export async function updateUserProfile(
  userId: number,
  profileData: {
    name?: string;
    email?: string;
    phone?: string;
    deliveryAddress?: string;
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(users).set(profileData).where(eq(users.id, userId));

    const updatedUser = await getUserById(userId);
    return updatedUser;
  } catch (error) {
    console.error("[Database] Failed to update user profile:", error);
    throw error;
  }
}

// Funciones para transacciones de pago con Flow

/**
 * Crea una nueva transacción de pago
 */
export async function createPaymentTransaction(
  transactionData: InsertPaymentTransaction
): Promise<PaymentTransaction> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(paymentTransactions).values(transactionData);
    const transactionId = Number(result[0].insertId);

    const transaction = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.id, transactionId))
      .limit(1);

    if (transaction.length === 0) {
      throw new Error("Failed to retrieve created transaction");
    }

    return transaction[0];
  } catch (error) {
    console.error("[Database] Failed to create payment transaction:", error);
    throw error;
  }
}

/**
 * Obtiene una transacción de pago por su token de Flow
 */
export async function getPaymentTransactionByToken(
  flowToken: string
): Promise<PaymentTransaction | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.flowToken, flowToken))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(
      "[Database] Failed to get payment transaction by token:",
      error
    );
    throw error;
  }
}

/**
 * Obtiene una transacción de pago por el ID de comercio
 */
export async function getPaymentTransactionByCommerceOrder(
  commerceOrder: string
): Promise<PaymentTransaction | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.commerceOrder, commerceOrder))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(
      "[Database] Failed to get payment transaction by commerce order:",
      error
    );
    throw error;
  }
}

/**
 * Obtiene transacciones de pago por ID de orden
 */
export async function getPaymentTransactionsByOrderId(
  orderId: number
): Promise<PaymentTransaction[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.orderId, orderId));

    return result;
  } catch (error) {
    console.error(
      "[Database] Failed to get payment transactions by order:",
      error
    );
    throw error;
  }
}

/**
 * Actualiza una transacción de pago
 */
export async function updatePaymentTransaction(
  transactionId: number,
  updateData: Partial<InsertPaymentTransaction>
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .update(paymentTransactions)
      .set(updateData)
      .where(eq(paymentTransactions.id, transactionId));
  } catch (error) {
    console.error("[Database] Failed to update payment transaction:", error);
    throw error;
  }
}

/**
 * Obtiene un pedido por su ID
 */
export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (result.length === 0) return null;

    const order = result[0];

    // Obtener los items del pedido
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    return { ...order, items };
  } catch (error) {
    console.error("[Database] Failed to get order by id:", error);
    throw error;
  }
}

// Funciones para gestión de reservas

/**
 * Obtiene todas las reservas con información del usuario y sus items
 */
export async function getAllReservations() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Obtener todas las reservas
    const allReservations = await db.select().from(reservations);

    // Para cada reserva, obtener información del usuario y sus items
    const reservationsWithDetails = await Promise.all(
      allReservations.map(async reservation => {
        const user = await getUserById(reservation.userId);

        // Obtener items de la reserva
        const items = await db
          .select()
          .from(reservationItems)
          .where(eq(reservationItems.reservationId, reservation.id));

        // Obtener información de cada producto
        const itemsWithProducts = await Promise.all(
          items.map(async item => {
            const product = await getProductById(item.productId);
            return {
              ...item,
              product: product
                ? {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                  }
                : null,
            };
          })
        );

        return {
          ...reservation,
          user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
              }
            : null,
          items: itemsWithProducts,
        };
      })
    );

    return reservationsWithDetails;
  } catch (error) {
    console.error("[Database] Failed to get all reservations:", error);
    throw error;
  }
}

/**
 * Actualiza el estado de una reserva
 */
export async function updateReservationStatus(
  reservationId: number,
  status: "pending" | "confirmed" | "cancelled" | "completed"
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .update(reservations)
      .set({ status })
      .where(eq(reservations.id, reservationId));
  } catch (error) {
    console.error("[Database] Failed to update reservation status:", error);
    throw error;
  }
}

// Funciones para configuración de despachos

/**
 * Obtiene la configuración actual de despachos
 * Si no existe, retorna una configuración por defecto
 */
export async function getDispatchSettings(): Promise<DispatchSettings> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.select().from(dispatchSettings).limit(1);

    // Si no existe configuración, crear una por defecto
    if (result.length === 0) {
      const defaultSettings: InsertDispatchSettings = {
        availableDays: JSON.stringify([1, 2, 3, 4, 5]), // Lunes a Viernes
        startTime: "09:00",
        endTime: "18:00",
        minAdvanceDays: 1,
        maxAdvanceDays: 30,
      };

      const insertResult = await db
        .insert(dispatchSettings)
        .values(defaultSettings);
      const settingsId = Number(insertResult[0].insertId);

      const newSettings = await db
        .select()
        .from(dispatchSettings)
        .where(eq(dispatchSettings.id, settingsId))
        .limit(1);

      return newSettings[0];
    }

    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get dispatch settings:", error);
    throw error;
  }
}

/**
 * Actualiza la configuración de despachos
 */
export async function updateDispatchSettings(
  settingsData: Partial<InsertDispatchSettings>
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Obtener la configuración actual para obtener el ID
    const current = await getDispatchSettings();

    await db
      .update(dispatchSettings)
      .set(settingsData)
      .where(eq(dispatchSettings.id, current.id));

    return getDispatchSettings();
  } catch (error) {
    console.error("[Database] Failed to update dispatch settings:", error);
    throw error;
  }
}

// Funciones para fechas bloqueadas

/**
 * Obtiene todas las fechas bloqueadas
 */
export async function getAllBlockedDates(): Promise<BlockedDate[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    return await db.select().from(blockedDates);
  } catch (error) {
    console.error("[Database] Failed to get blocked dates:", error);
    throw error;
  }
}

/**
 * Agrega una nueva fecha bloqueada
 */
export async function addBlockedDate(
  dateData: InsertBlockedDate
): Promise<BlockedDate> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Asegurar que la fecha sea un objeto Date válido y normalizada a medianoche
    let dateObj: Date;
    if (dateData.date instanceof Date) {
      dateObj = dateData.date;
    } else {
      dateObj = new Date(dateData.date as string);
    }

    // Normalizar la fecha a medianoche (00:00:00) para consistencia
    dateObj.setHours(0, 0, 0, 0);

    const dateToInsert = {
      ...dateData,
      date: dateObj,
    };

    console.log("[Database] Insertando fecha bloqueada:", dateToInsert);

    const result = await db.insert(blockedDates).values(dateToInsert);
    const dateId = Number(result[0].insertId);

    const blockedDate = await db
      .select()
      .from(blockedDates)
      .where(eq(blockedDates.id, dateId))
      .limit(1);

    if (!blockedDate || blockedDate.length === 0) {
      throw new Error(
        "No se pudo recuperar la fecha bloqueada después de insertarla"
      );
    }

    return blockedDate[0];
  } catch (error) {
    console.error("[Database] Failed to add blocked date:", error);
    console.error("[Database] Datos recibidos:", dateData);
    throw error;
  }
}

/**
 * Elimina una fecha bloqueada
 */
export async function removeBlockedDate(dateId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.delete(blockedDates).where(eq(blockedDates.id, dateId));
  } catch (error) {
    console.error("[Database] Failed to remove blocked date:", error);
    throw error;
  }
}

/**
 * Verifica si una fecha está disponible para despacho
 * @param date Fecha a verificar
 * @returns true si la fecha está disponible, false si está bloqueada
 */
export async function isDateAvailableForDispatch(date: Date): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Verificar si la fecha está en las fechas bloqueadas
    // Normalizar la fecha a medianoche
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    // Buscar fechas bloqueadas en el rango del día completo
    const blockedDate = await db
      .select()
      .from(blockedDates)
      .where(
        and(gte(blockedDates.date, dateStart), lte(blockedDates.date, dateEnd))
      )
      .limit(1);

    if (blockedDate.length > 0) {
      return false;
    }

    // Obtener configuración de despachos
    const settings = await getDispatchSettings();
    const availableDays = JSON.parse(settings.availableDays) as number[];

    // Verificar si el día de la semana está disponible (0=Domingo, 6=Sábado)
    const dayOfWeek = date.getDay();
    
    if (!availableDays.includes(dayOfWeek)) {
      return false;
    }

    // Verificar si está dentro del rango de anticipación
    // Normalizar ambas fechas a medianoche para comparación correcta
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0);
    
    const diffTime = reservationDate.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (
      diffDays < settings.minAdvanceDays ||
      diffDays > settings.maxAdvanceDays
    ) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Database] Failed to check date availability:", error);
    throw error;
  }
}
