import { Heart, Award, Users } from "lucide-react";
import { BRAND_INFO } from "@/const";

export default function AboutSection() {
  return (
    <div className="section-spacing bg-card">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Visual */}
          <div className="relative h-96 md:h-full min-h-96 animate-slideInLeft">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-pink-400/20 rounded-3xl overflow-hidden">
              <img
                src="/images/about/about-chef.svg"
                alt={`${BRAND_INFO.owner} - Chef y Emprendedora`}
                className="w-full h-full object-contain p-8 hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Info overlay */}
            <div className="absolute bottom-8 left-0 right-0 text-center px-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg py-3 px-4 inline-block shadow-lg">
                <h3 className="text-xl font-bold text-foreground">
                  {BRAND_INFO.owner}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Emprendedora de {BRAND_INFO.location}
                </p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-6 animate-slideInRight">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Conoce a{" "}
                <span className="gradient-accent">{BRAND_INFO.owner}</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {BRAND_INFO.owner} es una emprendedora apasionada de Temuco,
                Araucanía, que ha dedicado su vida a crear dulces artesanales de
                la más alta calidad. Con años de experiencia en la cocina y un
                profundo compromiso con los ingredientes naturales y orgánicos,
                ha transformado su pasión en {BRAND_INFO.name}.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/10">
                    <Heart className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Hecho con Amor</h3>
                  <p className="text-muted-foreground">
                    Cada producto es preparado con dedicación y cuidado,
                    pensando en el bienestar de nuestros clientes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/10">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Ingredientes Premium
                  </h3>
                  <p className="text-muted-foreground">
                    Utilizamos solo ingredientes naturales, orgánicos y de la
                    mejor calidad disponible en el mercado.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/10">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Comunidad Local
                  </h3>
                  <p className="text-muted-foreground">
                    Apoyamos a productores locales y contribuimos al desarrollo
                    económico de la región de la Araucanía.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-accent/10 rounded-lg p-6 border border-accent/20">
              <p className="text-sm italic text-foreground">
                "Mi objetivo es que cada persona que pruebe mis dulces sienta el
                amor y la dedicación con la que fueron preparados. La calidad no
                es una opción, es una promesa."
              </p>
              <p className="text-sm font-semibold text-accent mt-4">
                — {BRAND_INFO.owner}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
