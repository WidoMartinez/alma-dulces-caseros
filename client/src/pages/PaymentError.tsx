import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XCircle, Home, ShoppingCart } from "lucide-react";

/**
 * Página de error de pago
 * Se muestra cuando el usuario cancela el pago o hay un error en Flow
 */
export default function PaymentError() {
  const [, setLocation] = useLocation();

  // Obtener parámetros de la URL para mostrar más información
  const searchParams = new URLSearchParams(window.location.search);
  const errorMessage = searchParams.get("message") || "El pago no pudo ser procesado";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Pago Cancelado</CardTitle>
          <CardDescription>
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>¿Qué pasó?</strong>
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Tu pago no fue completado. Esto puede ocurrir si:
            </p>
            <ul className="text-sm text-amber-800 dark:text-amber-200 mt-2 list-disc list-inside space-y-1">
              <li>Cancelaste el proceso de pago</li>
              <li>Hubo un problema con tu tarjeta o cuenta</li>
              <li>Se agotó el tiempo de espera</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Tu pedido no se ha perdido</strong>
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              Los productos siguen en tu carrito. Puedes intentar realizar el pago nuevamente cuando estés listo.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setLocation("/")}
              className="w-full"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Intentar de nuevo
            </Button>
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              ¿Necesitas ayuda? Contáctanos en{" "}
              <a
                href="mailto:info@alma-dulces.cl"
                className="text-primary hover:underline"
              >
                info@alma-dulces.cl
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
