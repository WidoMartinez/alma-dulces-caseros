import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

/**
 * Página de éxito de pago
 * Se muestra después de que el usuario complete el pago en Flow
 */
export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(true);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);

  // Obtener el token de la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setIsConfirming(false);
      setConfirmationError("No se encontró el token de pago en la URL");
    }
  }, []);

  // Confirmar el pago con el backend
  const confirmPaymentMutation = trpc.payment.confirm.useMutation({
    onSuccess: () => {
      setIsConfirming(false);
      console.log("[PaymentSuccess] Pago confirmado exitosamente");
    },
    onError: (error) => {
      setIsConfirming(false);
      setConfirmationError(error.message);
      console.error("[PaymentSuccess] Error al confirmar pago:", error);
    },
  });

  // Confirmar el pago cuando tengamos el token
  useEffect(() => {
    if (token && !confirmPaymentMutation.isLoading && !confirmPaymentMutation.isSuccess && !confirmPaymentMutation.isError) {
      confirmPaymentMutation.mutate({ token });
    }
  }, [token]);

  // Obtener el estado del pago
  const { data: paymentStatus } = trpc.payment.status.useQuery(
    { token: token || "" },
    {
      enabled: !!token && confirmPaymentMutation.isSuccess,
      refetchInterval: false,
    }
  );

  if (isConfirming) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Confirmando tu pago...</h2>
            <p className="text-muted-foreground">
              Por favor espera mientras verificamos tu transacción
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmationError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardContent className="py-12 text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error al confirmar el pago</h2>
            <p className="text-muted-foreground mb-6">
              {confirmationError}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
              >
                Volver al inicio
              </Button>
              <Button
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-green-500">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">¡Pago Exitoso!</CardTitle>
          <CardDescription>
            Tu pago ha sido procesado correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatus && (
            <div className="bg-accent/10 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Orden:</span>
                <span className="font-medium">
                  #{paymentStatus.transaction.orderId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto:</span>
                <span className="font-medium">
                  ${(paymentStatus.transaction.amount / 100).toLocaleString("es-CL")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estado:</span>
                <span className="font-medium text-green-600">
                  Confirmado
                </span>
              </div>
              {paymentStatus.transaction.paymentMethod && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Método de pago:</span>
                  <span className="font-medium">
                    {paymentStatus.transaction.paymentMethod}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>¿Qué sigue?</strong>
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              Recibirás un email de confirmación con los detalles de tu pedido. 
              Nos pondremos en contacto contigo para coordinar la entrega.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="flex-1"
            >
              Volver al inicio
            </Button>
            {paymentStatus && (
              <Button
                onClick={() => setLocation(`/profile`)}
                className="flex-1"
              >
                Ver mis pedidos
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
