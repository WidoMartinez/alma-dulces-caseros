import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { BRAND_INFO, getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, MapPin, Leaf, Clock } from "lucide-react";
import HeroSection from "@/components/sections/HeroSection";
import ProductsSection from "@/components/sections/ProductsSection";
import AboutSection from "@/components/sections/AboutSection";
import ReservationSection from "@/components/sections/ReservationSection";
import ContactSection from "@/components/sections/ContactSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import Navigation from "@/components/Navigation";
import Cart from "@/components/Cart";
import { Toaster } from "sonner";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState("inicio");
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<Array<{ productId: number; quantity: number }>>([]);
  
  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();

  const addToCart = (productId: number, quantity: number) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation 
        activeSection={activeSection}
        onNavigate={scrollToSection}
        cartCount={cartItems.length}
        onCartClick={() => setShowCart(!showCart)}
        isAuthenticated={isAuthenticated}
      />

      {showCart && (
        <Cart 
          items={cartItems}
          products={products}
          onRemove={removeFromCart}
          onClose={() => setShowCart(false)}
        />
      )}

      <main>
        <section id="inicio">
          <HeroSection onShopClick={() => scrollToSection("productos")} />
        </section>

        <section id="productos">
          <ProductsSection 
            products={products}
            categories={categories}
            onAddToCart={addToCart}
          />
        </section>

        <section id="acerca-de">
          <AboutSection />
        </section>

        <section id="testimonios">
          <TestimonialsSection />
        </section>

        <section id="reservas">
          <ReservationSection isAuthenticated={isAuthenticated} />
        </section>

        <section id="contacto">
          <ContactSection />
        </section>
      </main>

      <footer className="bg-foreground text-background py-12 mt-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Alma</h3>
              <p className="text-sm opacity-90">{BRAND_INFO.description}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ubicación</h4>
              <p className="text-sm opacity-90 flex items-center gap-2">
                <MapPin size={16} />
                {BRAND_INFO.location}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <p className="text-sm opacity-90">Email: info@alma-dulces.cl</p>
              <p className="text-sm opacity-90">Tel: +56 9 XXXX XXXX</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Síguenos</h4>
              <div className="flex gap-4">
                <a href="#" className="text-sm opacity-90 hover:opacity-100">Instagram</a>
                <a href="#" className="text-sm opacity-90 hover:opacity-100">Facebook</a>
              </div>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm opacity-75">
            <p>&copy; 2024 Alma - Dulces Caseros Artesanales. Todos los derechos reservados.</p>
            <p className="mt-2">Hecho con amor por Alejandra Sáez en Temuco, Araucanía</p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
