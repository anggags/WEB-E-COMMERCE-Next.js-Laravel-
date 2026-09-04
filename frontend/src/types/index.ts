export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children?: Category[];
  products_count?: number;
}

export interface ProductImage {
  id?: number;
  url: string;
}

export interface ProductVariant {
  id: number;
  name: string;
  extra_price: string;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  is_active: boolean;
  category?: Category;
  images: ProductImage[];
  variants?: ProductVariant[];
  avg_rating?: number;
  reviews_count?: number;
}

export interface CartItem {
  id: number;
  product?: Product;
  variant?: ProductVariant | null;
  qty: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  items_count: number;
  qty: number;
  total: number;
}

export interface Address {
  id: number;
  label?: string;
  recipient_name: string;
  phone: string;
  full_address: string;
  city: string;
  postal_code?: string;
  is_default: boolean;
}

export interface Payment {
  id: number;
  method?: string;
  reference?: string;
  status?: string;
  paid_at?: string;
  snap_token?: string;
}

export interface OrderItem {
  id: number;
  price: number;
  qty: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: number;
  invoice_no: string;
  status: string;
  total: number;
  created_at?: string;
  items?: OrderItem[];
  address?: Address;
  payment?: Payment;
}

export interface WishlistItem {
  id: number;
  product: Product;
  created_at?: string;
}

export interface Review {
  id: number;
  product_id: number;
  rating: number;
  comment?: string;
  created_at?: string;
  user?: Pick<User, "id" | "name">;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: Record<string, string>;
}
