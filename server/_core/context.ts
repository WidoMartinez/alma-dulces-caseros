import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import type { User } from "../../drizzle/schema";
import { verifySessionToken } from "./auth";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Obtiene el token de sesión desde las cookies
 */
function getSessionToken(req: CreateExpressContextOptions["req"]): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const cookies = parseCookieHeader(cookieHeader);
  return cookies[COOKIE_NAME] || null;
}

/**
 * Crea el contexto para tRPC con autenticación basada en sesión
 */
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Obtener token de sesión
    const token = getSessionToken(opts.req);
    if (token) {
      console.log("[Context] Token encontrado en cookie");
      // Verificar token
      const session = await verifySessionToken(token);
      if (session) {
        console.log("[Context] Token válido, usuario ID:", session.userId);
        // Obtener usuario de la base de datos
        user = (await db.getUserById(session.userId)) || null;
        if (user) {
          console.log("[Context] Usuario cargado:", user.username, "- Role:", user.role);
        } else {
          console.warn("[Context] Usuario no encontrado en BD para ID:", session.userId);
        }
      } else {
        console.warn("[Context] Token inválido o expirado");
      }
    } else {
      console.log("[Context] No se encontró token en cookies");
    }
  } catch (error) {
    // La autenticación es opcional para procedimientos públicos
    console.warn("[Context] Error al autenticar usuario:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
