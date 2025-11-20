import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, User, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

const statusLabels: Record<ReservationStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  completed: "bg-green-100 text-green-800 border-green-300",
};

/**
 * Componente para gestión de reservas en el panel de administración
 */
export default function ReservationsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">(
    "all"
  );

  const utils = trpc.useUtils();
  const { data: reservations = [], isLoading } =
    trpc.admin.reservations.list.useQuery();

  const updateStatusMutation = trpc.admin.reservations.updateStatus.useMutation(
    {
      onSuccess: () => {
        toast.success("Estado de reserva actualizado exitosamente");
        utils.admin.reservations.list.invalidate();
      },
      onError: error => {
        toast.error("Error al actualizar estado: " + error.message);
      },
    }
  );

  const handleStatusChange = (
    reservationId: number,
    newStatus: ReservationStatus
  ) => {
    updateStatusMutation.mutate({
      reservationId,
      status: newStatus,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  // Filtrar reservas
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch =
      searchTerm === "" ||
      reservation.user?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reservation.user?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (reservation.items &&
        reservation.items.some(item =>
          item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Reservas</CardTitle>
        <CardDescription>
          Administra y actualiza el estado de las reservas de clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o producto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={statusFilter}
            onValueChange={value =>
              setStatusFilter(value as ReservationStatus | "all")
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="confirmed">Confirmada</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabla de reservas */}
        {isLoading ? (
          <div className="text-center py-8">Cargando reservas...</div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "No se encontraron reservas con los filtros aplicados."
              : "No hay reservas registradas."}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Fecha Reserva</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map(reservation => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      #{reservation.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {reservation.user?.name || "Usuario desconocido"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {reservation.user?.email}
                          </div>
                          {reservation.user?.phone && (
                            <div className="text-xs text-muted-foreground">
                              {reservation.user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div className="space-y-1">
                          {reservation.items && reservation.items.length > 0 ? (
                            reservation.items.map((item, idx) => (
                              <div key={idx}>
                                <div className="font-medium text-sm">
                                  {item.product?.name || "Producto eliminado"}
                                </div>
                                {item.product && (
                                  <div className="text-xs text-muted-foreground">
                                    {formatPrice(item.product.price)} ×{" "}
                                    {item.quantity}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Sin productos
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {reservation.items
                        ? reservation.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )
                        : 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(reservation.reservedDate), "PPP", {
                            locale: es,
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[reservation.status]}
                      >
                        {statusLabels[reservation.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={reservation.status}
                        onValueChange={value =>
                          handleStatusChange(
                            reservation.id,
                            value as ReservationStatus
                          )
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="confirmed">Confirmar</SelectItem>
                          <SelectItem value="completed">Completar</SelectItem>
                          <SelectItem value="cancelled">Cancelar</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Resumen */}
        {!isLoading && reservations.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Mostrando {filteredReservations.length} de {reservations.length}{" "}
              reservas
            </div>
            <div className="flex gap-4">
              <span>
                Pendientes:{" "}
                {reservations.filter(r => r.status === "pending").length}
              </span>
              <span>
                Confirmadas:{" "}
                {reservations.filter(r => r.status === "confirmed").length}
              </span>
              <span>
                Completadas:{" "}
                {reservations.filter(r => r.status === "completed").length}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
