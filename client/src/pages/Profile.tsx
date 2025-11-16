import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Package, ArrowLeft, LogOut, Save } from "lucide-react";

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "En Camino", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Datos del perfil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const utils = trpc.useUtils();

  // Obtener datos del perfil
  const { data: profile } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Obtener pedidos del usuario
  const { data: orders = [] } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Sesión cerrada exitosamente");
      setLocation("/");
      utils.auth.me.invalidate();
    },
  });

  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Perfil actualizado exitosamente");
      setIsEditing(false);
      utils.profile.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar el perfil");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  // Cargar datos del perfil
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setDeliveryAddress(profile.deliveryAddress || "");
    }
  }, [profile]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para acceder a tu perfil");
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  const handleSaveProfile = () => {
    setIsLoading(true);
    updateProfileMutation.mutate({
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      deliveryAddress: deliveryAddress.trim() || undefined,
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!isAuthenticated || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>

        <div className="grid gap-6">
          {/* Información del perfil */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-6 w-6" />
                    Mi Perfil
                  </CardTitle>
                  <CardDescription>Gestiona tu información personal</CardDescription>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      Editar Perfil
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          // Restaurar valores originales
                          if (profile) {
                            setName(profile.name || "");
                            setEmail(profile.email || "");
                            setPhone(profile.phone || "");
                            setDeliveryAddress(profile.deliveryAddress || "");
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={isLoading}>
                        <Save className="mr-2 h-4 w-4" />
                        {isLoading ? "Guardando..." : "Guardar"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de Usuario</Label>
                  <Input
                    id="username"
                    value={profile.username || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    El nombre de usuario no se puede cambiar
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Input
                    id="role"
                    value={profile.role === "admin" ? "Administrador" : "Cliente"}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing || isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing || isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing || isLoading}
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Dirección de Entrega</Label>
                <Textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  disabled={!isEditing || isLoading}
                  placeholder="Calle, número, comuna, región..."
                  rows={3}
                />
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Historial de pedidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                Mis Pedidos
              </CardTitle>
              <CardDescription>
                Historial de tus pedidos realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">No tienes pedidos todavía</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Cuando realices un pedido, aparecerá aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:border-accent transition-colors cursor-pointer"
                      onClick={() => setLocation(`/track-order?tracking=${order.trackingNumber}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-mono text-sm font-semibold">
                            {order.trackingNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("es-CL", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <Badge className={statusConfig[order.status as keyof typeof statusConfig]?.color}>
                          {statusConfig[order.status as keyof typeof statusConfig]?.label}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          {order.items?.length || 0} producto(s)
                        </p>
                        <p className="font-bold text-accent">
                          ${(order.totalPrice / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
