import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  Package,
  ShoppingCart,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReservationSectionProps {
  isAuthenticated: boolean;
}

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export default function ReservationSection({
  isAuthenticated,
}: ReservationSectionProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState(1);

  const { data: allProducts = [] } = trpc.products.list.useQuery();
  const { data: dispatchSettings } = trpc.dispatch.getSettings.useQuery();

  // Filtrar solo productos que tienen opción completa para reservas
  const products = allProducts.filter(p => p.hasWholeOption && p.wholePrice);

  const createReservationMutation = trpc.reservations.create.useMutation({
    onSuccess: () => {
      toast.success("Reserva realizada exitosamente");
      setStep(1);
      setSelectedDate("");
      setSelectedProductId("");
      setQuantity(1);
      setNotes("");
      setCart([]);
    },
    onError: error => {
      toast.error(error.message || "Error al crear la reserva");
    },
  });

  // Agregar producto al carrito
  const handleAddToCart = () => {
    if (!selectedProductId) {
      toast.error("Por favor selecciona un producto");
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;

    // Verificar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.productId === product.id);

    // Para reservas, siempre usar el precio de unidad completa
    const priceToUse = product.wholePrice || product.price;

    if (existingItem) {
      // Actualizar cantidad
      setCart(
        cart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
      toast.success(`Cantidad actualizada: ${product.name}`);
    } else {
      // Agregar nuevo item
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          quantity,
          price: priceToUse,
        },
      ]);
      toast.success(`Agregado al carrito: ${product.name}`);
    }

    // Reset selección
    setSelectedProductId("");
    setQuantity(1);
    setStep(Math.max(step, 2));
  };

  // Eliminar item del carrito
  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
    toast.info("Producto eliminado del carrito");
  };

  // Actualizar cantidad en el carrito
  const handleUpdateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(
      cart.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleReserve = () => {
    if (!selectedDate) {
      toast.error("Por favor selecciona una fecha");
      return;
    }

    if (cart.length === 0) {
      toast.error("Debes agregar al menos un producto al carrito");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para hacer una reserva");
      return;
    }

    // Crear la reserva con múltiples items
    createReservationMutation.mutate({
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      reservedDate: selectedDate,
      notes: notes.trim() || undefined,
    });
  };

  // Calcular fecha mínima y máxima basado en la configuración
  const minAdvanceDays = dispatchSettings?.minAdvanceDays || 1;
  const maxAdvanceDays = dispatchSettings?.maxAdvanceDays || 30;

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + minAdvanceDays);
  const minDateStr = minDate.toISOString().split("T")[0];

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxAdvanceDays);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  return (
    <div className="section-spacing bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Sistema de <span className="gradient-accent">Reservas</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Reserva tus dulces favoritos con anticipación. Elige la fecha que
            desees y nosotros nos encargaremos de preparar tus productos con la
            máxima calidad.
          </p>
          <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20 max-w-2xl mx-auto">
            <p className="text-sm text-center">
              💡 <strong>Nota:</strong> Las reservas solo están disponibles para productos completos.
              Para porciones individuales, utiliza el carrito de compras.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left - Steps */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  step >= 1
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Selecciona la Fecha
                </h3>
                <p className="text-muted-foreground text-sm">
                  Elige cuándo deseas recibir tus dulces. Disponemos de entregas
                  desde mañana.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  step >= 2
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Elige la Cantidad
                </h3>
                <p className="text-muted-foreground text-sm">
                  Especifica cuántas unidades deseas reservar de tus productos
                  favoritos.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  step >= 3
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Confirma tu Reserva
                </h3>
                <p className="text-muted-foreground text-sm">
                  Recibe una confirmación por correo y recibirás tus dulces en
                  la fecha acordada.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="bg-card rounded-lg p-8 border border-border shadow-lg">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <ShoppingCart size={24} />
              Hacer una Reserva
            </h3>

            <div className="space-y-6">
              {/* Product Selection */}
              <div>
                <label className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Package size={18} className="text-accent" />
                  Agregar Productos
                </label>
                <div className="space-y-3">
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                    disabled={!isAuthenticated}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                        >
                          {product.name} ({product.wholeName || "Completo"}) - ${((product.wholePrice || product.price) / 100).toFixed(0)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedProductId && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 border border-border rounded-lg hover:bg-accent/10 transition-colors"
                        >
                          −
                        </button>
                        <span className="text-lg font-bold min-w-8 text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3 py-2 border border-border rounded-lg hover:bg-accent/10 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <Button
                        onClick={handleAddToCart}
                        size="sm"
                        className="gap-2"
                      >
                        <Plus size={16} />
                        Agregar
                      </Button>
                    </div>
                  )}
                </div>
                {!isAuthenticated && (
                  <p className="text-xs text-destructive mt-2">
                    Debes iniciar sesión para hacer una reserva
                  </p>
                )}
              </div>

              {/* Cart Items */}
              {cart.length > 0 && (
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <ShoppingCart size={16} className="text-accent" />
                    Productos en tu carrito ({cart.length})
                  </h4>
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between gap-3 p-3 bg-accent/5 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {item.productName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${(item.price / 100).toFixed(0)} c/u (Completo)
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateCartQuantity(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                            className="px-2 py-1 border border-border rounded hover:bg-accent/10 transition-colors text-sm"
                          >
                            −
                          </button>
                          <span className="font-bold min-w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateCartQuantity(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                            className="px-2 py-1 border border-border rounded hover:bg-accent/10 transition-colors text-sm"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(item.productId)}
                            className="ml-2 p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Selection */}
              {cart.length > 0 && (
                <div>
                  <label className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Calendar size={18} className="text-accent" />
                    Fecha de Entrega
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => {
                      setSelectedDate(e.target.value);
                      setStep(Math.max(step, 3));
                    }}
                    min={minDateStr}
                    max={maxDateStr}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Reserva con {minAdvanceDays} día
                    {minAdvanceDays > 1 ? "s" : ""} de anticipación mínima
                  </p>
                </div>
              )}

              {/* Notes */}
              {cart.length > 0 && selectedDate && (
                <div>
                  <label className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Clock size={18} className="text-accent" />
                    Notas Especiales (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Cuéntanos si tienes preferencias especiales..."
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background resize-none"
                    rows={3}
                  />
                </div>
              )}

              {/* Summary */}
              {cart.length > 0 && selectedDate && (
                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Resumen de tu reserva:</strong>
                  </p>
                  <p className="text-sm">
                    Fecha:{" "}
                    <strong>
                      {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                        "es-CL"
                      )}
                    </strong>
                  </p>
                  <p className="text-sm">
                    Total de productos: <strong>{cart.length}</strong>
                  </p>
                  <p className="text-sm">
                    Total de unidades:{" "}
                    <strong>
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </strong>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleReserve}
                  disabled={
                    !selectedDate ||
                    cart.length === 0 ||
                    !isAuthenticated ||
                    createReservationMutation.isPending
                  }
                  className="w-full"
                >
                  {createReservationMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Procesando...
                    </>
                  ) : (
                    "Confirmar Reserva"
                  )}
                </Button>
                {!isAuthenticated && (
                  <p className="text-xs text-destructive text-center">
                    Debes iniciar sesión para hacer una reserva
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
