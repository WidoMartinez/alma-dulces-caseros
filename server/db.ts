import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  categories,
  products,
  orders,
  reservations,
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

const mockProducts = [
  {
    id: 1,
    categoryId: 1,
    name: "Tarta de Frutos Rojos",
    description:
      "Deliciosa tarta con frutos rojos frescos y crema artesanal",
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
  { id: 1, name: "Tartas", description: "Tartas artesanales deliciosas", createdAt: new Date() },
  { id: 2, name: "Galletas", description: "Galletas crujientes y sabrosas", createdAt: new Date() },
  { id: 3, name: "Brownies", description: "Brownies de chocolate intenso", createdAt: new Date() },
  { id: 4, name: "Mermeladas", description: "Mermeladas caseras naturales", createdAt: new Date() },
];

export async function getAllProducts() {
  const db = await getDb();
  if (!db) {
    return mockProducts;
  }
  
  try {
    return await db.select().from(products);
  } catch (error) {
    console.warn("[Database] Query failed, using mock data:", error instanceof Error ? error.message : error);
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
    console.warn("[Database] Query failed, using mock data:", error instanceof Error ? error.message : error);
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
  return db.select().from(reservations).where(eq(reservations.userId, userId));
}
