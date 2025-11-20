import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { rateLimit } from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Rate limiting para protección contra fuerza bruta en login
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === "development" ? 100 : 5, // más permisivo en desarrollo
    message:
      "Demasiados intentos de inicio de sesión. Por favor, intenta más tarde.",
    standardHeaders: true,
    legacyHeaders: false,
    // Aplicar solo a rutas de autenticación
    skip: req => !req.url.includes("/api/trpc/auth.login"),
  });

  app.use(loginLimiter);

  app.post("/api/flow/webhook", async (req, res) => {
    const token =
      (typeof req.body?.token === "string" && req.body.token.trim()) ||
      (typeof req.query?.token === "string" ? req.query.token : "");
    const signature =
      (typeof req.body?.s === "string" && req.body.s) ||
      (typeof req.query?.s === "string" ? req.query.s : undefined);

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token de Flow requerido",
      });
    }

    try {
      const ctx = await createContext({ req, res });
      const caller = appRouter.createCaller(ctx);
      const result = await caller.payment.confirm({
        token,
        s: signature,
      });

      res.json({
        success: true,
        status: result.status,
      });
    } catch (error: any) {
      console.error("[Flow] Error al procesar webhook:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error al confirmar pago",
      });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
