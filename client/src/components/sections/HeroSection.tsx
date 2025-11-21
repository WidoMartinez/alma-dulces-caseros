import { Button } from "@/components/ui/button";
import { BRAND_INFO } from "@/const";
import { Heart, Leaf, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onShopClick: () => void;
}

export default function HeroSection({ onShopClick }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-accent/5">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-400/10 rounded-full blur-3xl opacity-20"></div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-slideInLeft">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart size={20} className="text-accent" />
                <span className="text-sm font-semibold text-accent">
                  Bienvenido a Alma
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Dulces Artesanales
                <span className="block gradient-accent">con Alma</span>
              </h1>
            </div>

            <p className="text-lg text-muted-foreground max-w-lg">
              Cada producto es cocinado artesanalmente por {BRAND_INFO.owner}{" "}
              con ingredientes naturales y orgánicos de la más alta calidad.
              Sabor auténtico, hecho con dedicación.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={onShopClick}
                className="btn-accent text-base px-8 py-6"
              >
                Explorar Productos
              </Button>
              <Button variant="outline" className="text-base px-8 py-6">
                Más Información
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Leaf size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm">100% Natural</p>
                  <p className="text-xs text-muted-foreground">
                    Ingredientes orgánicos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Sparkles size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Artesanal</p>
                  <p className="text-xs text-muted-foreground">
                    Hecho con amor
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-96 md:h-full min-h-96 animate-slideInRight">
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/images/hero/hero-main.png"
                alt="Dulces Artesanales Alma"
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
