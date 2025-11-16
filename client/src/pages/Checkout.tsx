import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ShoppingBag, ArrowLeft } from "lucide-react";

interface CheckoutProps {
  cartItems: Array<{ productId: number; quantity: number }>;
  onCheckoutComplete: () => void;
}

export default function Checkout({ cartItems, onCheckoutComplete }: CheckoutProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Formulario
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");

  // Obtener datos del usuario si está autenticado
  const { data: profile } = trpc.profile.get.useQuery(undefined, {
    enabled: !!user,
  });

  // Obtener productos
  const { data: products = [] } = trpc.products.list.useQuery();

  // Pre-llenar formulario si el usuario está autenticado
  useEffect(() => {
    if (profile) {
      setCustomerName(profile.name || "");
      setCustomerEmail(profile.email || "");
      setCustomerPhone(profile.phone || "");
      setDeliveryAddress(profile.deliveryAddress || "");
    }
  }, [profile]);

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      toast.success("¡Pedido creado exitosamente!");
      setLocation(`/track-order?tracking=${data.trackingNumber}`);
      onCheckoutComplete();
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear el pedido");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  // Calcular productos del carrito
  const cartProducts = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter(Boolean) as Array<any>;

  const total = cartProducts.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!customerName.trim() || !customerEmail.trim() || !deliveryAddress.trim()) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    setIsLoading(true);

    // Preparar items del pedido
    const orderItems = cartItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: product?.price || 0,
      };
    });

    createOrderMutation.mutate({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim() || undefined,
      deliveryAddress: deliveryAddress.trim(),
      deliveryDate: deliveryDate || undefined,
      notes: notes.trim() || undefined,
      items: orderItems,
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container max-w-4xl mx-auto py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Carrito vacío</h2>
              <p className="text-muted-foreground mb-6">
                Agrega productos al carrito para realizar una compra
              </p>
              <Button onClick={() => setLocation("/")}>
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Formulario de pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Entrega</CardTitle>
              <CardDescription>
                {user ? "Completa los datos para tu pedido" : "Realiza tu compra como invitado"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nombre Completo *</Label>
                  <Input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={isLoading}
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Te enviaremos la confirmación y seguimiento a este correo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Teléfono (opcional)</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Dirección de Entrega *</Label>
                  <Textarea
                    id="deliveryAddress"
                    placeholder="Calle, número, comuna, región..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    disabled={isLoading}
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Fecha de Entrega Deseada (opcional)</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    disabled={isLoading}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Instrucciones especiales, horario de entrega, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      Confirmar Pedido
                    </>
                  )}
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    ¿Tienes cuenta?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-xs"
                      onClick={() => setLocation("/login")}
                    >
                      Inicia sesión
                    </Button>
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Resumen del pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartProducts.map((item) => (
                  <div key={item.id} className="flex justify-between items-start pb-4 border-b border-border last:border-b-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${(item.price / 100).toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                ))}

                <div className="pt-4 border-t-2 border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">${(total / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-accent">${(total / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <p className="text-xs text-muted-foreground">
                    <strong>Nota:</strong> El pago se coordinará directamente con el equipo de Alma Dulces Caseros. Recibirás un email con los detalles de tu pedido y las opciones de pago disponibles.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
