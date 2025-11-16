import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { authenticateUser, createSessionToken } from "./_core/auth";
import { 
  getAllProducts, 
  getProductById, 
  getAllCategories, 
  getUserOrders, 
  getUserReservations,
  createProduct,
  updateProduct,
  deleteProduct
} from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    login: publicProcedure
      .input(
        z.object({
          usernameOrEmail: z.string().min(1, "Username o email requerido"),
          password: z.string().min(1, "Contraseña requerida"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Autenticar usuario
        const user = await authenticateUser(input.usernameOrEmail, input.password);
        
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Credenciales inválidas",
          });
        }

        // Crear token de sesión
        const sessionToken = await createSessionToken(user, {
          expiresInMs: ONE_YEAR_MS,
        });

        // Establecer cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  products: router({
    list: publicProcedure.query(() => getAllProducts()),
    getById: publicProcedure.input(z.number()).query(({ input }) => getProductById(input)),
  }),

  categories: router({
    list: publicProcedure.query(() => getAllCategories()),
  }),

  orders: router({
    list: protectedProcedure.query(({ ctx }) => getUserOrders(ctx.user.id)),
  }),

  reservations: router({
    list: protectedProcedure.query(({ ctx }) => getUserReservations(ctx.user.id)),
  }),

  admin: router({
    products: router({
      create: adminProcedure
        .input(z.object({
          categoryId: z.number(),
          name: z.string().min(1).max(150),
          description: z.string().optional(),
          ingredients: z.string().optional(),
          price: z.number().min(0),
          imageUrl: z.string().max(500).optional(),
          available: z.number().min(0).default(0),
          organic: z.number().min(0).max(1).default(1),
        }))
        .mutation(async ({ input }) => {
          await createProduct(input);
          return { success: true };
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          categoryId: z.number().optional(),
          name: z.string().min(1).max(150).optional(),
          description: z.string().optional(),
          ingredients: z.string().optional(),
          price: z.number().min(0).optional(),
          imageUrl: z.string().max(500).optional(),
          available: z.number().min(0).optional(),
          organic: z.number().min(0).max(1).optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await updateProduct(id, data);
          return { success: true };
        }),

      delete: adminProcedure
        .input(z.number())
        .mutation(async ({ input }) => {
          await deleteProduct(input);
          return { success: true };
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
