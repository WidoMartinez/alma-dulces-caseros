import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

/**
 * Componente para gestionar fechas bloqueadas (feriados, días no laborables)
 */
export default function BlockedDatesManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingDateId, setDeletingDateId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");

  const utils = trpc.useUtils();
  const { data: blockedDates = [], isLoading } =
    trpc.admin.dispatchSettings.getBlockedDates.useQuery();

  const addBlockedDateMutation =
    trpc.admin.dispatchSettings.addBlockedDate.useMutation({
      onSuccess: () => {
        toast.success("Fecha bloqueada agregada exitosamente");
        utils.admin.dispatchSettings.getBlockedDates.invalidate();
        closeAddDialog();
      },
      onError: error => {
        toast.error("Error al agregar fecha bloqueada: " + error.message);
      },
    });

  const removeBlockedDateMutation =
    trpc.admin.dispatchSettings.removeBlockedDate.useMutation({
      onSuccess: () => {
        toast.success("Fecha bloqueada eliminada exitosamente");
        utils.admin.dispatchSettings.getBlockedDates.invalidate();
        setIsDeleteDialogOpen(false);
        setDeletingDateId(null);
      },
      onError: error => {
        toast.error("Error al eliminar fecha bloqueada: " + error.message);
      },
    });

  const openAddDialog = () => {
    setNewDate("");
    setNewReason("");
    setIsAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    setNewDate("");
    setNewReason("");
  };

  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDate) {
      toast.error("Debes seleccionar una fecha");
      return;
    }

    if (!newReason.trim()) {
      toast.error("Debes ingresar una razón para el bloqueo");
      return;
    }

    // Validar que la fecha sea futura o hoy
    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("No puedes bloquear una fecha pasada");
      return;
    }

    // Asegurar que la fecha se envíe en formato ISO correcto
    // El input type="date" devuelve formato YYYY-MM-DD, añadimos la hora
    const dateToSend = new Date(newDate);
    dateToSend.setHours(0, 0, 0, 0);

    addBlockedDateMutation.mutate({
      date: dateToSend.toISOString(),
      reason: newReason.trim(),
    });
  };

  const openDeleteDialog = (dateId: number) => {
    setDeletingDateId(dateId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingDateId !== null) {
      removeBlockedDateMutation.mutate(deletingDateId);
    }
  };

  // Ordenar fechas bloqueadas por fecha (más próximas primero)
  const sortedBlockedDates = [...blockedDates].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fechas Bloqueadas</CardTitle>
            <CardDescription>
              Gestiona fechas no disponibles para despacho (feriados,
              vacaciones, etc.)
            </CardDescription>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Fecha
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Cargando fechas bloqueadas...</div>
        ) : sortedBlockedDates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay fechas bloqueadas registradas.</p>
            <p className="text-sm mt-1">
              Agrega fechas que no estarán disponibles para despachos.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Razón</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBlockedDates.map(blockedDate => {
                  const dateObj = new Date(blockedDate.date);
                  const isPast = dateObj < new Date();

                  return (
                    <TableRow
                      key={blockedDate.id}
                      className={isPast ? "opacity-50" : ""}
                    >
                      <TableCell className="font-medium">
                        {format(dateObj, "PPP", { locale: es })}
                        {isPast && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Pasada)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{blockedDate.reason}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(blockedDate.createdAt), "PPp", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(blockedDate.id)}
                          disabled={removeBlockedDateMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Dialog para agregar fecha bloqueada */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Fecha Bloqueada</DialogTitle>
            <DialogDescription>
              Bloquea una fecha específica para que no esté disponible para
              despachos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddBlockedDate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="blocked-date">Fecha*</Label>
                <Input
                  id="blocked-date"
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Razón*</Label>
                <Input
                  id="reason"
                  placeholder="Ej: Feriado Nacional, Vacaciones"
                  value={newReason}
                  onChange={e => setNewReason(e.target.value)}
                  maxLength={255}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Describe brevemente por qué esta fecha está bloqueada
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeAddDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={addBlockedDateMutation.isPending}>
                Agregar Fecha
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta fecha bloqueada? Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={removeBlockedDateMutation.isPending}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
