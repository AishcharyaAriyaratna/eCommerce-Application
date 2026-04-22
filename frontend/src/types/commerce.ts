export type UserRole = 'Customer' | 'Supplier' | 'Data Steward';

export interface FoodProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  supplierId: string;
  supplierName: string;
  stock: number;
  status: 'approved' | 'pending';
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartLineItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface FoodOrder {
  id: string;
  userSub: string;
  userName: string;
  status: 'placed' | 'processing' | 'delivered';
  createdAt: string;
  items: CartLineItem[];
  total: number;
}

export interface AppUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
}

export interface ProductFilters {
  search: string;
  category: string;
}
