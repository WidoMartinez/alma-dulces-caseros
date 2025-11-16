import { Star, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  location: string;
  content: string;
  rating: number;
  avatar: string;
  productMentioned?: string;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    name: "María González",
    role: "Cliente desde 2023",
    location: "Temuco",
    content: "Los dulces de Alma son simplemente deliciosos. La calidad de los ingredientes se nota en cada bocado. He probado varias tartas y todas han sido perfectas. ¡Recomendado 100%! Alejandra tiene un don especial para la repostería.",
    rating: 5,
    avatar: "👩",
    productMentioned: "Tarta de Frutos Rojos",
    verified: true,
  },
  {
    name: "Carlos Rodríguez",
    role: "Cliente frecuente",
    location: "Temuco",
    content: "Excelente servicio y productos de primera calidad. Alejandra es muy atenta y profesional. Mis tartas favoritas son perfectas para cualquier ocasión. Siempre me sorprende con nuevas creaciones.",
    rating: 5,
    avatar: "👨",
    productMentioned: "Tarta de Chocolate",
    verified: true,
  },
  {
    name: "Ana Martínez",
    role: "Cliente corporativo",
    location: "Villarrica",
    content: "Utilizamos los productos de Alma para eventos corporativos y siempre son un éxito. Los clientes siempre preguntan quién hizo los dulces. La presentación y el sabor son impecables. Muy recomendable para eventos especiales.",
    rating: 5,
    avatar: "👩",
    productMentioned: "Variedad de productos",
    verified: true,
  },
  {
    name: "Roberto Silva",
    role: "Cliente recurrente",
    location: "Pucón",
    content: "Descubrí Alma por recomendación de una amiga y no me arrepiento. Los brownies son adictivos, hechos con chocolate de verdad. La atención de Alejandra es excepcional y siempre está dispuesta a hacer pedidos personalizados.",
    rating: 5,
    avatar: "👨",
    productMentioned: "Brownie de Chocolate Oscuro",
    verified: true,
  },
  {
    name: "Francisca Peña",
    role: "Emprendedora local",
    location: "Temuco",
    content: "Como emprendedora, admiro mucho el trabajo de Alejandra. Sus productos son de excelente calidad y su dedicación es inspiradora. He recomendado Alma a muchas amigas y todas quedan encantadas con los dulces.",
    rating: 5,
    avatar: "👩",
    productMentioned: "Mermelada de Fresa",
    verified: true,
  },
  {
    name: "Javier Contreras",
    role: "Chef pastelero",
    location: "Temuco",
    content: "Como profesional de la gastronomía, reconozco la calidad artesanal en cada producto de Alma. Los ingredientes son premium, las técnicas son correctas y el resultado es delicioso. Felicidades a Alejandra por su trabajo.",
    rating: 5,
    avatar: "👨",
    productMentioned: "Todas las tartas",
    verified: true,
  },
];

export default function TestimonialsSection() {
  const averageRating = (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1);

  return (
    <div className="section-spacing bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Lo que dicen nuestros <span className="gradient-accent">Clientes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Conoce las experiencias de quienes ya han probado nuestros dulces artesanales y confían en la calidad de Alma.
          </p>
          
          {/* Rating Summary */}
          <div className="flex items-center justify-center gap-4 bg-accent/10 rounded-lg p-4 inline-block">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className="fill-accent text-accent"
                />
              ))}
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">{averageRating} de 5</p>
              <p className="text-sm text-muted-foreground">{testimonials.length} clientes verificados</p>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300 hover:border-accent/50 relative group"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote size={32} className="text-accent" />
              </div>

              {/* Verified Badge */}
              {testimonial.verified && (
                <div className="absolute top-4 left-4 bg-accent/20 text-accent px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <span>✓</span>
                  <span>Verificado</span>
                </div>
              )}

              {/* Rating */}
              <div className="flex gap-1 mb-4 mt-8">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-accent text-accent"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-4 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Product Mentioned */}
              {testimonial.productMentioned && (
                <div className="mb-4 text-sm bg-accent/10 rounded-lg p-2 text-accent font-medium">
                  Producto: {testimonial.productMentioned}
                </div>
              )}

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    📍 {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="mt-16 bg-accent/5 rounded-xl p-8 border border-accent/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-accent mb-2">{testimonials.length}+</p>
              <p className="text-muted-foreground">Clientes Satisfechos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent mb-2">{averageRating}</p>
              <p className="text-muted-foreground">Calificación Promedio</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent mb-2">100%</p>
              <p className="text-muted-foreground">Recomendación</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            ¿Quieres ser parte de nuestra comunidad de clientes satisfechos?
          </p>
          <a
            href="#productos"
            className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
          >
            Explorar Productos
          </a>
        </div>
      </div>
    </div>
  );
}
