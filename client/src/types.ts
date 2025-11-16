export interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  ingredients: string | null;
  price: number;
  imageUrl: string | null;
  available: number;
  organic: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface Order {
  id: number;
  userId: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  deliveryDate?: Date;
  deliveryAddress?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reservation {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  reservedDate: Date;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
