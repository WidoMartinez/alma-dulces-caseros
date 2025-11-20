import { X, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Product } from "@/types";

interface CartProps {
  items: Array<{ productId: number; quantity: number; isWholeUnit?: boolean }>;
  products: Product[];
  onRemove: (productId: number, isWholeUnit?: boolean) => void;
  onClose: () => void;
  onCheckout: () => void;
}

export default function Cart({ items, products, onRemove, onClose, onCheckout }: CartProps) {
  const cartProducts = items
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { ...product, quantity: item.quantity, isWholeUnit: item.isWholeUnit } : null;
    })
    .filter(Boolean) as Array<any>;

  const total = cartProducts.reduce((sum, item) => {
    if (!item) return sum;
    // Usar wholePrice si está seleccionado y disponible, sino usar precio normal
    const price = item.isWholeUnit && item.hasWholeOption && item.wholePrice 
      ? item.wholePrice 
      : item.price;
    return sum + (price * item.quantity) / 100;
  }, 0);

  const handleCheckout = () => {
    onCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <ShoppingBag size={20} className="text-accent" />
            </div>
            <h2 className="text-xl font-bold">Mi Carrito</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6">
          {cartProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">Tu carrito está vacío</p>
              <p className="text-xs text-muted-foreground mt-2">
                Agrega productos para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartProducts.map((item, index) => {
                if (!item) return null;
                const itemPrice = item.isWholeUnit && item.hasWholeOption && item.wholePrice 
                  ? item.wholePrice 
                  : item.price;
                return (
                  <div key={`${item.productId}-${item.isWholeUnit ? 'whole' : 'portion'}`} className="flex gap-4 pb-4 border-b border-border last:border-b-0">
                    <div className="text-3xl flex-shrink-0">
                      {item.name.includes("Frutos") ? "🍓" : 
                       item.name.includes("Chocolate") ? "🍫" :
                       item.name.includes("Galleta") ? "🍪" :
                       item.name.includes("Brownie") ? "🍫" :
                       item.name.includes("Mermelada") ? "🍓" : "🍰"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
                      {item.isWholeUnit && item.hasWholeOption && (
                        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                          {item.wholeName || "Completo"}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        ${(itemPrice / 100).toFixed(2)} x {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-accent mt-2">
                        ${((itemPrice * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onRemove(item.productId, item.isWholeUnit);
                        toast.success("Producto removido del carrito");
                      }}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartProducts.length > 0 && (
          <div className="sticky bottom-0 bg-card border-t border-border p-6 space-y-4">
            <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Subtotal:</span>
                <span className="text-sm font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Envío:</span>
                <span className="text-sm font-medium">Gratis</span>
              </div>
              <div className="border-t border-accent/20 pt-2 flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold text-accent">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleCheckout}
                className="w-full btn-accent"
              >
                Proceder al Pago
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={onClose}
              >
                Seguir Comprando
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
