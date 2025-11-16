import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, Search, CheckCircle, XCircle, Truck, Clock, ArrowLeft } from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: Clock,
    description: "Tu pedido ha sido recibido y está siendo procesado",
  },
  confirmed: {
    label: "Confirmado",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: CheckCircle,
    description: "Tu pedido ha sido confirmado y está en preparación",
  },
  shipped: {
    label: "En Camino",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    icon: Truck,
    description: "Tu pedido está en camino a tu dirección",
  },
  delivered: {
    label: "Entregado",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: CheckCircle,
    description: "Tu pedido ha sido entregado exitosamente",
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: XCircle,
    description: "Este pedido ha sido cancelado",
  },
};

export default function TrackOrder() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [searchedTracking, setSearchedTracking] = useState("");

  // Obtener tracking number de la URL si existe
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams);
    const trackingFromUrl = urlParams.get("tracking");
    if (trackingFromUrl) {
      setTrackingNumber(trackingFromUrl);
      setSearchedTracking(trackingFromUrl);
    }
  }, [searchParams]);

  // Query para buscar el pedido
  const { data: order, isLoading, error } = trpc.orders.track.useQuery(
    { trackingNumber: searchedTracking },
    { enabled: !!searchedTracking, retry: false }
  );

  const { data: products = [] } = trpc.products.list.useQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error("Por favor ingresa un número de seguimiento");
      return;
    }
    setSearchedTracking(trackingNumber.trim());
  };

  const getProductName = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || "Producto desconocido";
  };

  const getProductPrice = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return product?.price || 0;
  };

  const status = order?.status || "pending";
  const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Package;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Seguimiento de Pedido
            </CardTitle>
            <CardDescription>
              Ingresa tu número de seguimiento para consultar el estado de tu pedido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="trackingNumber" className="sr-only">
                  Número de Seguimiento
                </Label>
                <Input
                  id="trackingNumber"
                  type="text"
                  placeholder="Ej: ALMA-12345-ABCD"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Mostrar error si no se encuentra el pedido */}
        {error && searchedTracking && (
          <Card className="border-destructive">
            <CardContent className="py-12 text-center">
              <XCircle size={48} className="mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Pedido no encontrado</h2>
              <p className="text-muted-foreground mb-6">
                No se encontró ningún pedido con el número de seguimiento:{" "}
                <span className="font-mono font-bold">{searchedTracking}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Verifica que el número sea correcto o contacta con nosotros para más información
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mostrar información del pedido */}
        {order && (
          <div className="space-y-6">
            {/* Estado del pedido */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Estado del Pedido</CardTitle>
                  <Badge className={statusConfig[status as keyof typeof statusConfig]?.color}>
                    <StatusIcon className="mr-1 h-4 w-4" />
                    {statusConfig[status as keyof typeof statusConfig]?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <p className="text-sm">
                    {statusConfig[status as keyof typeof statusConfig]?.description}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Seguimiento</p>
                    <p className="font-mono font-bold">{order.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Pedido</p>
                    <p className="font-semibold">
                      {new Date(order.createdAt).toLocaleDateString("es-CL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-semibold">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{order.customerEmail}</p>
                  </div>
                </div>

                {order.deliveryDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Entrega Solicitada</p>
                    <p className="font-semibold">
                      {new Date(order.deliveryDate).toLocaleDateString("es-CL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalles del pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start pb-4 border-b border-border last:border-b-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">
                          {getProductName(item.productId)}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          ${(item.priceAtPurchase / 100).toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold">
                        ${((item.priceAtPurchase * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}

                  <div className="pt-4 border-t-2 border-border">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-accent">${(order.totalPrice / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dirección de entrega */}
            <Card>
              <CardHeader>
                <CardTitle>Dirección de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{order.deliveryAddress}</p>
                {order.notes && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-semibold mb-1">Notas:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {order.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
