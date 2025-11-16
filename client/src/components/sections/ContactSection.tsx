import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { BRAND_INFO } from "@/const";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    toast.success("Mensaje enviado correctamente. Te contactaremos pronto.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="section-spacing bg-card">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            ¿Preguntas o <span className="gradient-accent">Sugerencias?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nos encantaría escucharte. Contáctanos por cualquier consulta sobre nuestros productos o servicios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8 animate-slideInLeft">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/10">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Ubicación</h3>
                <p className="text-muted-foreground">
                  {BRAND_INFO.location}
                  <br />
                  Región de la Araucanía, Chile
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/10">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Teléfono</h3>
                <p className="text-muted-foreground">
                  <a href="tel:+56912345678" className="hover:text-accent transition-colors">
                    +56 9 1234 5678
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/10">
                  <Mail className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Email</h3>
                <p className="text-muted-foreground">
                  <a href="mailto:info@alma-dulces.cl" className="hover:text-accent transition-colors">
                    info@alma-dulces.cl
                  </a>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Síguenos en Redes Sociales</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="p-3 bg-accent/10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className="p-3 bg-accent/10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>

            <div className="bg-accent/10 rounded-lg p-6 border border-accent/20">
              <h4 className="font-semibold mb-2">Horario de Atención</h4>
              <p className="text-sm text-muted-foreground">
                Lunes a Viernes: 9:00 AM - 6:00 PM
                <br />
                Sábados: 10:00 AM - 4:00 PM
                <br />
                Domingos: Cerrado
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-background rounded-lg p-8 border border-border shadow-lg animate-slideInRight">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-card"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-card"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Mensaje</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Cuéntanos tu consulta o sugerencia..."
                  rows={5}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-card resize-none"
                />
              </div>

              <Button type="submit" className="w-full">
                Enviar Mensaje
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
