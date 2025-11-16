/**
 * Servicio de integración con Flow (Pasarela de Pagos Chile)
 * Documentación oficial: https://www.flow.cl/docs/api.html
 */

import crypto from "crypto";
import axios from "axios";

// Configuración de Flow desde variables de entorno
const FLOW_API_KEY = process.env.FLOW_API_KEY || "";
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY || "";
const FLOW_API_URL = process.env.FLOW_API_URL || "https://sandbox.flow.cl/api";

/**
 * Tipos de datos para Flow
 */
export interface FlowPaymentRequest {
  commerceOrder: string;
  subject: string;
  currency: string;
  amount: number;
  email: string;
  urlConfirmation: string;
  urlReturn: string;
}

export interface FlowPaymentResponse {
  url: string;
  token: string;
  flowOrder: number;
}

export interface FlowPaymentStatus {
  flowOrder: number;
  commerceOrder: string;
  requestDate: string;
  status: number; // 1: pendiente, 2: pagado, 3: rechazado, 4: anulado
  subject: string;
  currency: string;
  amount: number;
  payer: string;
  optional?: any;
  pending_info?: any;
  paymentData?: {
    date: string;
    media: string; // medio de pago
    conversionDate?: string;
    conversionRate?: number;
    amount: number;
    currency: string;
    fee: number;
    balance: number;
    transferDate?: string;
  };
}

/**
 * Genera la firma para autenticar las peticiones a Flow
 * @param params Parámetros a firmar
 * @returns Firma HMAC-SHA256
 */
function generateSignature(params: Record<string, any>): string {
  // Ordenar parámetros alfabéticamente
  const sortedKeys = Object.keys(params).sort();
  
  // Crear string con formato key=value&key=value
  const dataToSign = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join("&");
  
  // Generar firma HMAC-SHA256
  const signature = crypto
    .createHmac("sha256", FLOW_SECRET_KEY)
    .update(dataToSign)
    .digest("hex");
  
  return signature;
}

/**
 * Verifica que las credenciales de Flow estén configuradas
 */
function validateFlowConfig(): void {
  if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
    throw new Error("Credenciales de Flow no configuradas. Verifica las variables de entorno FLOW_API_KEY y FLOW_SECRET_KEY");
  }
}

/**
 * Crea una orden de pago en Flow
 * @param request Datos del pago
 * @returns URL de pago y token de Flow
 */
export async function createFlowPayment(request: FlowPaymentRequest): Promise<FlowPaymentResponse> {
  validateFlowConfig();
  
  // Preparar parámetros
  const params = {
    apiKey: FLOW_API_KEY,
    commerceOrder: request.commerceOrder,
    subject: request.subject,
    currency: request.currency,
    amount: request.amount,
    email: request.email,
    urlConfirmation: request.urlConfirmation,
    urlReturn: request.urlReturn,
  };
  
  // Generar firma
  const signature = generateSignature(params);
  
  // Agregar firma a los parámetros
  const requestParams = {
    ...params,
    s: signature,
  };
  
  console.log("[Flow] Creando orden de pago:", {
    commerceOrder: request.commerceOrder,
    amount: request.amount,
    email: request.email,
  });
  
  try {
    // Realizar petición a Flow
    const response = await axios.post(
      `${FLOW_API_URL}/payment/create`,
      new URLSearchParams(requestParams).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    
    console.log("[Flow] Orden de pago creada exitosamente:", {
      token: response.data.token,
      flowOrder: response.data.flowOrder,
    });
    
    return {
      url: response.data.url + "?token=" + response.data.token,
      token: response.data.token,
      flowOrder: response.data.flowOrder,
    };
  } catch (error: any) {
    console.error("[Flow] Error al crear orden de pago:", error.response?.data || error.message);
    throw new Error(
      `Error al crear orden de pago en Flow: ${error.response?.data?.message || error.message}`
    );
  }
}

/**
 * Obtiene el estado de un pago en Flow
 * @param token Token del pago
 * @returns Estado del pago
 */
export async function getFlowPaymentStatus(token: string): Promise<FlowPaymentStatus> {
  validateFlowConfig();
  
  const params = {
    apiKey: FLOW_API_KEY,
    token,
  };
  
  const signature = generateSignature(params);
  
  const requestParams = {
    ...params,
    s: signature,
  };
  
  console.log("[Flow] Consultando estado del pago:", { token });
  
  try {
    const response = await axios.get(`${FLOW_API_URL}/payment/getStatus`, {
      params: requestParams,
    });
    
    console.log("[Flow] Estado del pago obtenido:", {
      flowOrder: response.data.flowOrder,
      status: response.data.status,
    });
    
    return response.data;
  } catch (error: any) {
    console.error("[Flow] Error al consultar estado del pago:", error.response?.data || error.message);
    throw new Error(
      `Error al consultar estado del pago en Flow: ${error.response?.data?.message || error.message}`
    );
  }
}

/**
 * Verifica la firma de una notificación de Flow (webhook)
 * @param params Parámetros recibidos del webhook
 * @param receivedSignature Firma recibida
 * @returns true si la firma es válida
 */
export function verifyFlowSignature(
  params: Record<string, any>,
  receivedSignature: string
): boolean {
  try {
    const calculatedSignature = generateSignature(params);
    return calculatedSignature === receivedSignature;
  } catch (error) {
    console.error("[Flow] Error al verificar firma:", error);
    return false;
  }
}

/**
 * Mapea el estado numérico de Flow a nuestro estado de orden
 * @param flowStatus Estado numérico de Flow
 * @returns Estado de la orden
 */
export function mapFlowStatusToOrderStatus(flowStatus: number): "pending" | "confirmed" | "cancelled" {
  switch (flowStatus) {
    case 1:
      return "pending"; // Pago pendiente
    case 2:
      return "confirmed"; // Pago pagado
    case 3:
    case 4:
      return "cancelled"; // Pago rechazado o anulado
    default:
      return "pending";
  }
}

/**
 * Mapea el estado numérico de Flow a nuestro estado de transacción
 * @param flowStatus Estado numérico de Flow
 * @returns Estado de la transacción
 */
export function mapFlowStatusToTransactionStatus(
  flowStatus: number
): "pending" | "completed" | "rejected" | "cancelled" {
  switch (flowStatus) {
    case 1:
      return "pending"; // Pago pendiente
    case 2:
      return "completed"; // Pago pagado
    case 3:
      return "rejected"; // Pago rechazado
    case 4:
      return "cancelled"; // Pago anulado
    default:
      return "pending";
  }
}
