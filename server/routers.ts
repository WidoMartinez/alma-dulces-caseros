import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { getAllProducts, getProductById, getAllCategories, getUserOrders, getUserReservations } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
});

export type AppRouter = typeof appRouter;
