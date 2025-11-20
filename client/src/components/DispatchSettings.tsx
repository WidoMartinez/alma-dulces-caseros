import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Save } from "lucide-react";
import { toast } from "sonner";

const daysOfWeek = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

/**
 * Componente para configurar días y horarios de despacho
 */
export default function DispatchSettings() {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [minAdvanceDays, setMinAdvanceDays] = useState(1);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);

  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.admin.dispatchSettings.get.useQuery();

  const updateSettingsMutation = trpc.admin.dispatchSettings.update.useMutation({
    onSuccess: () => {
      toast.success("Configuración actualizada exitosamente");
      utils.admin.dispatchSettings.get.invalidate();
    },
    onError: (error) => {
      toast.error("Error al actualizar configuración: " + error.message);
    },
  });

  // Cargar configuración actual
  useEffect(() => {
    if (settings) {
      try {
        const days = JSON.parse(settings.availableDays) as number[];
        setSelectedDays(days);
      } catch (error) {
        console.error("Error al parsear días disponibles:", error);
        setSelectedDays([1, 2, 3, 4, 5]); // Default: Lunes a Viernes
      }
      setStartTime(settings.startTime);
      setEndTime(settings.endTime);
      setMinAdvanceDays(settings.minAdvanceDays);
      setMaxAdvanceDays(settings.maxAdvanceDays);
    }
  }, [settings]);

  const toggleDay = (dayValue: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (selectedDays.length === 0) {
      toast.error("Debes seleccionar al menos un día disponible");
      return;
    }

    if (startTime >= endTime) {
      toast.error("La hora de inicio debe ser anterior a la hora de fin");
      return;
    }

    if (minAdvanceDays < 0) {
      toast.error("Los días de anticipación mínima no pueden ser negativos");
      return;
    }

    if (maxAdvanceDays <= minAdvanceDays) {
      toast.error("Los días de anticipación máxima deben ser mayores que los mínimos");
      return;
    }

    updateSettingsMutation.mutate({
      availableDays: JSON.stringify(selectedDays),
      startTime,
      endTime,
      minAdvanceDays,
      maxAdvanceDays,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Cargando configuración...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Despachos</CardTitle>
        <CardDescription>
          Define los días y horarios disponibles para despachar pedidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Días disponibles */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Días disponibles para despacho
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  <Label
                    htmlFor={`day-${day.value}`}
                    className="cursor-pointer font-normal"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Selecciona los días de la semana en que se realizarán despachos
            </p>
          </div>

          <Separator />

          {/* Horarios */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horarios de despacho
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Define el rango horario en que se pueden realizar despachos
            </p>
          </div>

          <Separator />

          {/* Anticipación */}
          <div className="space-y-3">
            <Label>Anticipación para reservas</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAdvanceDays">Mínimo de días</Label>
                <Input
                  id="minAdvanceDays"
                  type="number"
                  min="0"
                  value={minAdvanceDays}
                  onChange={(e) => setMinAdvanceDays(parseInt(e.target.value) || 0)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Días mínimos de anticipación
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAdvanceDays">Máximo de días</Label>
                <Input
                  id="maxAdvanceDays"
                  type="number"
                  min="1"
                  value={maxAdvanceDays}
                  onChange={(e) => setMaxAdvanceDays(parseInt(e.target.value) || 1)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Días máximos de anticipación
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Define con cuánta anticipación los clientes pueden reservar
            </p>
          </div>

          <Separator />

          {/* Botón guardar */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateSettingsMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Configuración
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
