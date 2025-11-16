import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import { toast } from "sonner";

interface ReservationSectionProps {
  isAuthenticated: boolean;
}

export default function ReservationSection({ isAuthenticated }: ReservationSectionProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState(1);

  const handleReserve = () => {
    if (!selectedDate) {
      toast.error("Por favor selecciona una fecha");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para hacer una reserva");
      return;
    }

    // Here we would submit the reservation
    toast.success("Reserva realizada exitosamente");
    setStep(1);
    setSelectedDate("");
    setQuantity(1);
    setNotes("");
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Get maximum date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  return (
    <div className="section-spacing bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Sistema de <span className="gradient-accent">Reservas</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Reserva tus dulces favoritos con anticipación. Elige la fecha que desees y nosotros nos encargaremos de preparar tus productos con la máxima calidad.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left - Steps */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                step >= 1 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
              }`}>
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Selecciona la Fecha</h3>
                <p className="text-muted-foreground text-sm">
                  Elige cuándo deseas recibir tus dulces. Disponemos de entregas desde mañana.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                step >= 2 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
              }`}>
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Elige la Cantidad</h3>
                <p className="text-muted-foreground text-sm">
                  Especifica cuántas unidades deseas reservar de tus productos favoritos.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                step >= 3 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
              }`}>
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Confirma tu Reserva</h3>
                <p className="text-muted-foreground text-sm">
                  Recibe una confirmación por correo y recibirás tus dulces en la fecha acordada.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="bg-card rounded-lg p-8 border border-border shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Hacer una Reserva</h3>

            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                  <Calendar size={18} className="text-accent" />
                  Fecha de Entrega
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setStep(Math.max(step, 2));
                  }}
                  min={minDate}
                  max={maxDateStr}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Disponible desde mañana hasta 3 meses adelante
                </p>
              </div>

              {/* Quantity Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                    <Users size={18} className="text-accent" />
                    Cantidad de Unidades
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-accent/10 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-2xl font-bold min-w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-accent/10 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                    <Clock size={18} className="text-accent" />
                    Notas Especiales (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Cuéntanos si tienes preferencias especiales..."
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background resize-none"
                    rows={3}
                  />
                </div>
              )}

              {/* Summary */}
              {selectedDate && (
                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Resumen de tu reserva:</strong>
                  </p>
                  <p className="text-sm">
                    Fecha: <strong>{new Date(selectedDate).toLocaleDateString("es-CL")}</strong>
                  </p>
                  <p className="text-sm">
                    Cantidad: <strong>{quantity} unidades</strong>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleReserve}
                  disabled={!selectedDate || !isAuthenticated}
                  className="w-full"
                >
                  Confirmar Reserva
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
