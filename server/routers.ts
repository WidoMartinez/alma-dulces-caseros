import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import {
  publicProcedure,
  router,
  protectedProcedure,
  adminProcedure,
} from "./_core/trpc";
import { authenticateUser, createSessionToken } from "./_core/auth";
import {
  getAllProducts,
  getProductById,
  getAllCategories,
  getUserOrders,
  getUserReservations,
  createProduct,
  updateProduct,
  deleteProduct,
  registerUser,
  createOrder,
  getOrderByTrackingNumber,
  getOrdersByUserId,
  updateOrderStatus,
  updateUserProfile,
  getUserById,
  createPaymentTransaction,
  getPaymentTransactionByToken,
  getPaymentTransactionByCommerceOrder,
  updatePaymentTransaction,
  getOrderById,
  getAllReservations,
  updateReservationStatus,
  getDispatchSettings,
  updateDispatchSettings,
  getAllBlockedDates,
  addBlockedDate,
  removeBlockedDate,
  isDateAvailableForDispatch,
} from "./db";
import { hashPassword } from "./_core/auth";
import { z } from "zod";
import {
  createFlowPayment,
  getFlowPaymentStatus,
  verifyFlowSignature,
  mapFlowStatusToOrderStatus,
  mapFlowStatusToTransactionStatus,
} from "./flow";

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
        console.log("[Auth] Intento de login:", input.usernameOrEmail);

        // Autenticar usuario
        const user = await authenticateUser(
          input.usernameOrEmail,
          input.password
        );

        if (!user) {
          console.log(
            "[Auth] Autenticación fallida para:",
            input.usernameOrEmail
          );
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Credenciales inválidas",
          });
        }

        console.log(
          "[Auth] Usuario autenticado:",
          user.username,
          "- Role:",
          user.role
        );

        // Crear token de sesión
        const sessionToken = await createSessionToken(user, {
          expiresInMs: ONE_YEAR_MS,
        });

        console.log("[Auth] Token creado, estableciendo cookie...");

        // Establecer cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        console.log(
          "[Auth] Cookie establecida. Opciones:",
          JSON.stringify(cookieOptions)
        );

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

    register: publicProcedure
      .input(
        z.object({
          username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(64),
          email: z.string().email("Email inválido").max(320),
          password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
          name: z.string().min(1, "El nombre es requerido"),
          phone: z.string().optional(),
          deliveryAddress: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        console.log("[Auth] Intento de registro:", input.username);

        // Hash de la contraseña
        const passwordHash = await hashPassword(input.password);

        try {
          const user = await registerUser({
            ...input,
            password: passwordHash,
          });

          console.log("[Auth] Usuario registrado exitosamente:", user?.username);

          return {
            success: true,
            user: user ? {
              id: user.id,
              username: user.username,
              email: user.email,
              name: user.name,
              role: user.role,
            } : null,
          };
        } catch (error) {
          console.error("[Auth] Error al registrar usuario:", error);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Error al registrar usuario. El nombre de usuario o email ya existe.",
          });
        }
      }),
  }),

  products: router({
    list: publicProcedure.query(() => getAllProducts()),
    getById: publicProcedure
      .input(z.number())
      .query(({ input }) => getProductById(input)),
  }),

  categories: router({
    list: publicProcedure.query(() => getAllCategories()),
  }),

  orders: router({
    // Listar pedidos del usuario autenticado
    list: protectedProcedure.query(({ ctx }) => getOrdersByUserId(ctx.user.id)),

    // Crear un nuevo pedido (cliente registrado o invitado)
    create: publicProcedure
      .input(
        z.object({
          customerEmail: z.string().email("Email inválido"),
          customerName: z.string().min(1, "El nombre es requerido"),
          customerPhone: z.string().optional(),
          deliveryAddress: z.string().min(10, "La dirección debe tener al menos 10 caracteres"),
          deliveryDate: z.string().optional(),
          notes: z.string().optional(),
          items: z.array(
            z.object({
              productId: z.number(),
              quantity: z.number().min(1),
              priceAtPurchase: z.number(),
            })
          ).min(1, "Debe haber al menos un producto en el pedido"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        console.log("[Orders] Creando nuevo pedido");

        // Calcular el precio total
        const totalPrice = input.items.reduce(
          (sum, item) => sum + item.priceAtPurchase * item.quantity,
          0
        );

        // Determinar si es usuario registrado o invitado
        const isGuest = !ctx.user;
        const userId = ctx.user?.id;

        try {
          const result = await createOrder({
            userId,
            customerEmail: input.customerEmail,
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            isGuest,
            totalPrice,
            deliveryAddress: input.deliveryAddress,
            deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : undefined,
            notes: input.notes,
            items: input.items,
          });

          console.log("[Orders] Pedido creado:", result.trackingNumber);

          return {
            success: true,
            orderId: result.orderId,
            trackingNumber: result.trackingNumber,
          };
        } catch (error) {
          console.error("[Orders] Error al crear pedido:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al crear el pedido",
          });
        }
      }),

    // Consultar pedido por número de seguimiento (público)
    track: publicProcedure
      .input(z.object({
        trackingNumber: z.string().min(1, "Número de seguimiento requerido"),
      }))
      .query(async ({ input }) => {
        console.log("[Orders] Consultando pedido:", input.trackingNumber);

        try {
          const order = await getOrderByTrackingNumber(input.trackingNumber);

          if (!order) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Pedido no encontrado",
            });
          }

          return order;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Orders] Error al consultar pedido:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al consultar el pedido",
          });
        }
      }),
  }),

  // Gestión de perfil de usuario
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no encontrado",
        });
      }
      return user;
    }),

    update: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          deliveryAddress: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        console.log("[Profile] Actualizando perfil del usuario:", ctx.user.id);

        try {
          const updatedUser = await updateUserProfile(ctx.user.id, input);
          return {
            success: true,
            user: updatedUser,
          };
        } catch (error) {
          console.error("[Profile] Error al actualizar perfil:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al actualizar el perfil",
          });
        }
      }),
  }),

  reservations: router({
    list: protectedProcedure.query(({ ctx }) =>
      getUserReservations(ctx.user.id)
    ),
  }),

  admin: router({
    // Gestión de pedidos para administradores
    orders: router({
      list: adminProcedure.query(async () => {
        // Por ahora retorna un array vacío, se puede implementar más adelante
        return [];
      }),

      updateStatus: adminProcedure
        .input(
          z.object({
            orderId: z.number(),
            status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
          })
        )
        .mutation(async ({ input }) => {
          console.log("[Admin] Actualizando estado de pedido:", input.orderId);

          try {
            await updateOrderStatus(input.orderId, input.status);
            return { success: true };
          } catch (error) {
            console.error("[Admin] Error al actualizar estado:", error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Error al actualizar el estado del pedido",
            });
          }
        }),
    }),

    products: router({
      create: adminProcedure
        .input(
          z.object({
            categoryId: z.number(),
            name: z.string().min(1).max(150),
            description: z.string().optional(),
            ingredients: z.string().optional(),
            price: z.number().min(0),
            imageUrl: z.string().max(500).optional(),
            available: z.number().min(0).default(0),
            organic: z.number().min(0).max(1).default(1),
          })
        )
        .mutation(async ({ input }) => {
          await createProduct(input);
          return { success: true };
        }),

      update: adminProcedure
        .input(
          z.object({
            id: z.number(),
            categoryId: z.number().optional(),
            name: z.string().min(1).max(150).optional(),
            description: z.string().optional(),
            ingredients: z.string().optional(),
            price: z.number().min(0).optional(),
            imageUrl: z.string().max(500).optional(),
            available: z.number().min(0).optional(),
            organic: z.number().min(0).max(1).optional(),
          })
        )
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          await updateProduct(id, data);
          return { success: true };
        }),

      delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
        await deleteProduct(input);
        return { success: true };
      }),
    }),

    // Gestión de reservas para administradores
    reservations: router({
      list: adminProcedure.query(async () => {
        console.log("[Admin] Listando todas las reservas");
        try {
          return await getAllReservations();
        } catch (error) {
          console.error("[Admin] Error al listar reservas:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al obtener las reservas",
          });
        }
      }),

      updateStatus: adminProcedure
        .input(
          z.object({
            reservationId: z.number(),
            status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
          })
        )
        .mutation(async ({ input }) => {
          console.log("[Admin] Actualizando estado de reserva:", input.reservationId);
          try {
            await updateReservationStatus(input.reservationId, input.status);
            return { success: true };
          } catch (error) {
            console.error("[Admin] Error al actualizar estado de reserva:", error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Error al actualizar el estado de la reserva",
            });
          }
        }),
    }),

    // Configuración de despachos
    dispatchSettings: router({
      get: adminProcedure.query(async () => {
        console.log("[Admin] Obteniendo configuración de despachos");
        try {
          return await getDispatchSettings();
        } catch (error) {
          console.error("[Admin] Error al obtener configuración:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al obtener la configuración de despachos",
          });
        }
      }),

      update: adminProcedure
        .input(
          z.object({
            availableDays: z.string().optional(), // JSON array de días
            startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
            endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
            minAdvanceDays: z.number().min(0).optional(),
            maxAdvanceDays: z.number().min(1).optional(),
          })
        )
        .mutation(async ({ input }) => {
          console.log("[Admin] Actualizando configuración de despachos");
          try {
            return await updateDispatchSettings(input);
          } catch (error) {
            console.error("[Admin] Error al actualizar configuración:", error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Error al actualizar la configuración de despachos",
            });
          }
        }),

      getBlockedDates: adminProcedure.query(async () => {
        console.log("[Admin] Obteniendo fechas bloqueadas");
        try {
          return await getAllBlockedDates();
        } catch (error) {
          console.error("[Admin] Error al obtener fechas bloqueadas:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al obtener las fechas bloqueadas",
          });
        }
      }),

      addBlockedDate: adminProcedure
        .input(
          z.object({
            date: z.string(), // ISO date string
            reason: z.string().min(1).max(255),
          })
        )
        .mutation(async ({ input }) => {
          console.log("[Admin] Agregando fecha bloqueada:", input.date);
          try {
            // Convertir la fecha string a Date y asegurarse de que sea válida
            const dateObj = new Date(input.date);
            
            // Validar que la fecha sea válida
            if (isNaN(dateObj.getTime())) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "La fecha proporcionada no es válida",
              });
            }

            console.log("[Admin] Fecha convertida:", dateObj);
            
            const blockedDate = await addBlockedDate({
              date: dateObj,
              reason: input.reason,
            });
            
            console.log("[Admin] Fecha bloqueada agregada:", blockedDate);
            return { success: true, blockedDate };
          } catch (error) {
            console.error("[Admin] Error al agregar fecha bloqueada:", error);
            // Si el error ya es un TRPCError, lanzarlo directamente
            if (error instanceof TRPCError) {
              throw error;
            }
            // De lo contrario, envolver el error
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: error instanceof Error ? error.message : "Error al agregar la fecha bloqueada",
            });
          }
        }),

      removeBlockedDate: adminProcedure
        .input(z.number())
        .mutation(async ({ input }) => {
          console.log("[Admin] Eliminando fecha bloqueada:", input);
          try {
            await removeBlockedDate(input);
            return { success: true };
          } catch (error) {
            console.error("[Admin] Error al eliminar fecha bloqueada:", error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Error al eliminar la fecha bloqueada",
            });
          }
        }),
    }),
  }),

  // Endpoint público para validar disponibilidad de fechas
  dispatch: router({
    checkAvailability: publicProcedure
      .input(z.object({
        date: z.string(), // ISO date string
      }))
      .query(async ({ input }) => {
        console.log("[Dispatch] Verificando disponibilidad de fecha:", input.date);
        try {
          const date = new Date(input.date);
          const isAvailable = await isDateAvailableForDispatch(date);
          return { available: isAvailable };
        } catch (error) {
          console.error("[Dispatch] Error al verificar disponibilidad:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al verificar disponibilidad de la fecha",
          });
        }
      }),
  }),

  // Endpoints de pago con Flow
  payment: router({
    /**
     * Crea una orden de pago en Flow y retorna la URL de pago
     */
    create: publicProcedure
      .input(
        z.object({
          orderId: z.number(),
          amount: z.number().positive(),
          customerEmail: z.string().email(),
          subject: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        console.log("[Payment] Creando orden de pago:", input);

        try {
          // Verificar que la orden existe
          const order = await getOrderById(input.orderId);
          if (!order) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Orden no encontrada",
            });
          }

          // Generar ID de orden de comercio único
          const commerceOrder = `ALMA-${order.id}-${Date.now()}`;

          // Obtener URLs de entorno
          const defaultBaseUrl = "http://localhost:5000";
          const urlReturn =
            process.env.FLOW_RETURN_URL ||
            `${defaultBaseUrl}/payment/success`;
          const urlConfirmation =
            process.env.FLOW_CONFIRMATION_URL ||
            `${defaultBaseUrl}/api/flow/webhook`;

          // Crear orden de pago en Flow
          const flowPayment = await createFlowPayment({
            commerceOrder,
            subject: input.subject,
            currency: "CLP",
            amount: input.amount,
            email: input.customerEmail,
            urlConfirmation,
            urlReturn,
          });

          // Guardar transacción en base de datos
          await createPaymentTransaction({
            orderId: input.orderId,
            flowToken: flowPayment.token,
            commerceOrder,
            flowOrder: String(flowPayment.flowOrder),
            amount: input.amount,
            status: "pending",
            paymentData: JSON.stringify({
              url: flowPayment.url,
              createdAt: new Date().toISOString(),
            }),
          });

          console.log("[Payment] Orden de pago creada exitosamente:", {
            commerceOrder,
            flowOrder: flowPayment.flowOrder,
          });

          return {
            success: true,
            paymentUrl: flowPayment.url,
            token: flowPayment.token,
            flowOrder: flowPayment.flowOrder,
          };
        } catch (error: any) {
          console.error("[Payment] Error al crear orden de pago:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Error al crear orden de pago",
          });
        }
      }),

    /**
     * Confirma un pago recibido desde Flow (webhook)
     */
    confirm: publicProcedure
      .input(
        z.object({
          token: z.string(),
          s: z.string().optional(), // Firma de Flow
        })
      )
      .mutation(async ({ input }) => {
        console.log("[Payment] Confirmando pago:", input.token);

        try {
          // Verificar firma si está presente
          if (input.s) {
            const params = { token: input.token };
            const isValidSignature = verifyFlowSignature(params, input.s);
            if (!isValidSignature) {
              console.error("[Payment] Firma inválida recibida");
              throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Firma inválida",
              });
            }
          }

          // Obtener estado del pago desde Flow
          const paymentStatus = await getFlowPaymentStatus(input.token);

          // Buscar transacción en base de datos
          const transaction = await getPaymentTransactionByToken(input.token);
          if (!transaction) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Transacción no encontrada",
            });
          }

          // Evitar procesar la misma transacción múltiples veces
          if (transaction.status === "completed") {
            console.log("[Payment] Transacción ya procesada:", transaction.id);
            return { success: true, message: "Transacción ya procesada" };
          }

          // Actualizar transacción
          const transactionStatus = mapFlowStatusToTransactionStatus(paymentStatus.status);
          await updatePaymentTransaction(transaction.id, {
            status: transactionStatus,
            flowOrder: String(paymentStatus.flowOrder),
            paymentMethod: paymentStatus.paymentData?.media,
            paymentData: JSON.stringify(paymentStatus),
          });

          // Actualizar estado de la orden si el pago fue exitoso
          if (paymentStatus.status === 2) { // Status 2 = Pagado
            const orderStatus = mapFlowStatusToOrderStatus(paymentStatus.status);
            await updateOrderStatus(transaction.orderId, orderStatus);
            console.log("[Payment] Orden confirmada:", transaction.orderId);
          } else {
            console.log("[Payment] Pago no exitoso, estado:", paymentStatus.status);
          }

          return {
            success: true,
            status: transactionStatus,
          };
        } catch (error: any) {
          console.error("[Payment] Error al confirmar pago:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Error al confirmar pago",
          });
        }
      }),

    /**
     * Obtiene el estado de un pago
     */
    status: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        console.log("[Payment] Consultando estado del pago:", input.token);

        try {
          const transaction = await getPaymentTransactionByToken(input.token);
          if (!transaction) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Transacción no encontrada",
            });
          }

          // Obtener estado actualizado desde Flow
          const flowStatus = await getFlowPaymentStatus(input.token);

          return {
            transaction,
            flowStatus,
          };
        } catch (error: any) {
          console.error("[Payment] Error al consultar estado:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Error al consultar estado del pago",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
