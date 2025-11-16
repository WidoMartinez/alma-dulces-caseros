import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Leaf, ShoppingCart, Star } from "lucide-react";
import type { Product, Category } from "@/types";
import { toast } from "sonner";
import ShareButtons from "@/components/ShareButtons";

interface ProductsSectionProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (productId: number, quantity: number) => void;
}

export default function ProductsSection({
  products,
  categories,
  onAddToCart,
}: ProductsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoryId === selectedCategory)
    : products;

  const handleAddToCart = (productId: number) => {
    const quantity = quantities[productId] || 1;
    onAddToCart(productId, quantity);
    toast.success("Producto agregado al carrito");
    setQuantities(prev => ({ ...prev, [productId]: 1 }));
  };

  const getProductEmoji = (productName: string): string => {
    const emojis: Record<string, string> = {
      "Tarta de Frutos Rojos": "🍓",
      "Tarta de Chocolate": "🍫",
      "Galletas de Avena y Miel": "🍪",
      "Galletas de Almendra": "🍪",
      "Brownie de Chocolate Oscuro": "🍫",
      "Brownie con Nueces": "🥜",
      "Mermelada de Fresa": "🍓",
      "Mermelada de Frambuesa": "🫐",
    };
    return emojis[productName] || "🍰";
  };

  return (
    <div className="section-spacing bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Nuestros <span className="gradient-accent">Productos</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada dulce es elaborado con los mejores ingredientes naturales y orgánicos, siguiendo recetas tradicionales con un toque moderno.
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === null
                  ? "bg-accent text-accent-foreground shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-accent/10"
              }`}
            >
              Todos
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? "bg-accent text-accent-foreground shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-accent/10"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="card-product group overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Product Image */}
              <div className="relative h-64 bg-gradient-to-br from-accent/15 to-pink-400/15 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="text-7xl group-hover:scale-125 transition-transform duration-300 animate-pulse-glow">
                  {getProductEmoji(product.name)}
                </div>
                {product.organic === 1 && (
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold shadow-md hover:shadow-lg transition-shadow">
                    <Leaf size={14} />
                    Orgánico
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-foreground">{product.name}</h3>
                
                {product.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {product.ingredients && (
                  <p className="text-xs text-muted-foreground mb-4 italic border-l-2 border-accent/30 pl-3">
                    {product.ingredients}
                  </p>
                )}

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < 4 ? "fill-accent text-accent" : "text-muted"}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">(12 reseñas)</span>
                </div>

                {/* Price and Quantity */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-accent">
                    ${(product.price / 100).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-2 bg-muted rounded-lg border border-border">
                    <button
                      onClick={() =>
                        setQuantities(prev => ({
                          ...prev,
                          [product.id]: Math.max(1, (prev[product.id] || 1) - 1),
                        }))
                      }
                      className="px-3 py-1 hover:bg-accent/10 transition-colors font-semibold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-foreground">
                      {quantities[product.id] || 1}
                    </span>
                    <button
                      onClick={() =>
                        setQuantities(prev => ({
                          ...prev,
                          [product.id]: (prev[product.id] || 1) + 1,
                        }))
                      }
                      className="px-3 py-1 hover:bg-accent/10 transition-colors font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-4">
                  {product.available > 0 ? (
                    <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                      Disponible ({product.available} unidades)
                    </p>
                  ) : (
                    <p className="text-sm text-destructive font-medium flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-destructive rounded-full"></span>
                      Agotado
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.available === 0}
                    className="w-full btn-accent"
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    Agregar al Carrito
                  </Button>
                  <ShareButtons
                    productName={product.name}
                    productDescription={product.description || undefined}
                    productEmoji={getProductEmoji(product.name)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No hay productos en esta categoría
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
