import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";
import { ONE_YEAR_MS } from "@shared/const";
import { ENV } from "./env";
import * as db from "../db";
import type { User } from "../../drizzle/schema";

const SALT_ROUNDS = 12;

/**
 * Payload de la sesión para tokens JWT
 */
export type SessionPayload = {
  userId: number;
  username: string;
  role: "user" | "admin";
};

/**
 * Hash de una contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifica si una contraseña coincide con su hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Obtiene la clave secreta para firmar tokens
 */
function getSessionSecret(): Uint8Array {
  const secret = ENV.cookieSecret;
  if (!secret) {
    throw new Error("JWT_SECRET no está configurado");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Crea un token de sesión JWT para un usuario
 */
export async function createSessionToken(
  user: User,
  options: { expiresInMs?: number } = {}
): Promise<string> {
  const issuedAt = Date.now();
  const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
  const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
  const secretKey = getSessionSecret();

  const payload: SessionPayload = {
    userId: user.id,
    username: user.username || user.email || `user_${user.id}`,
    role: user.role,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .setIssuedAt(Math.floor(issuedAt / 1000))
    .sign(secretKey);
}

/**
 * Verifica y decodifica un token de sesión
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) {
    console.warn("[Auth] Token de sesión no proporcionado");
    return null;
  }

  try {
    const secretKey = getSessionSecret();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    const { userId, username, role } = payload as unknown as Record<
      string,
      unknown
    >;

    if (
      typeof userId !== "number" ||
      typeof username !== "string" ||
      (role !== "user" && role !== "admin")
    ) {
      console.warn("[Auth] Token con payload inválido");
      return null;
    }

    return {
      userId,
      username,
      role,
    };
  } catch (error) {
    console.warn("[Auth] Verificación de token falló", String(error));
    return null;
  }
}

/**
 * Autentica un usuario por username/email y contraseña
 */
export async function authenticateUser(
  usernameOrEmail: string,
  password: string
): Promise<User | null> {
  // Buscar usuario por username o email
  const user = await db.getUserByUsernameOrEmail(usernameOrEmail);

  if (!user) {
    console.warn("[Auth] Usuario no encontrado:", usernameOrEmail);
    return null;
  }

  // Verificar que tenga contraseña configurada
  if (!user.password) {
    console.warn("[Auth] Usuario sin contraseña configurada:", usernameOrEmail);
    return null;
  }

  // Verificar contraseña
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    console.warn("[Auth] Contraseña inválida para:", usernameOrEmail);
    return null;
  }

  // Actualizar última conexión
  await db.updateUserLastSignIn(user.id);

  return user;
}

/**
 * Crea un nuevo usuario administrador
 */
export async function createAdmin(
  username: string,
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const passwordHash = await hashPassword(password);

  return db.createUser({
    username,
    email,
    password: passwordHash,
    name: name || null,
    role: "admin",
    loginMethod: "local",
  });
}

/**
 * Cambia la contraseña de un usuario
 */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const user = await db.getUserById(userId);
  if (!user || !user.password) {
    return false;
  }

  // Verificar contraseña actual
  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid) {
    return false;
  }

  // Hash de la nueva contraseña
  const newPasswordHash = await hashPassword(newPassword);

  // Actualizar en base de datos
  await db.updateUserPassword(userId, newPasswordHash);

  return true;
}
