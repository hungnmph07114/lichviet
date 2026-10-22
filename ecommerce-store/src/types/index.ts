export interface ProductOption {
  name: string; // e.g. "Màu sắc", "Phiên bản / Size"
  values: string[]; // e.g. ["Đen Nhám", "Bạc Ánh Kim"]
}

export interface ProductVariant {
  id: string;
  title: string; // e.g. "Đen Nhám / 128GB"
  sku?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  options: Record<string, string>; // { "Màu sắc": "Đen Nhám", "Phiên bản": "128GB" }
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  description: string;
  specs: Record<string, string>;
  options?: ProductOption[];
  variants?: ProductVariant[];
  isFeatured?: boolean;
  isFlashSale?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  image: string;
  itemCount?: number;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface OrderCustomer {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  variantTitle?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';
export type PaymentMethod = 'cod' | 'bank_transfer' | 'credit_card';

export interface ReturnRequest {
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  requestedAt: string;
  adminResponse?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  returnRequest?: ReturnRequest;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  deliveredOrders: number;
  pendingReturns: number;
  recentOrders: Order[];
  categoryBreakdown: { category: string; count: number; revenue: number }[];
}

export interface BankSettings {
  bankId: string; // e.g. "MB", "VCB", "TCB", "ACB", "VPB", "ICB"
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrTemplate: string;
  webhookProvider: 'manual' | 'payos' | 'casso';
  webhookApiKey?: string;
  webhookChecksumKey?: string;
  autoConfirmPaid: boolean;
}

export interface PaymentWebhookLog {
  id: string;
  orderNumber: string;
  amount: number;
  provider: string;
  rawPayload: any;
  status: 'success' | 'failed' | 'ignored';
  message: string;
  createdAt: string;
}
