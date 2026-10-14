export interface Scooter {
  id: string;
  name: string;
  model: string;
  slug: string;
  price: number;
  promoPrice?: number | null;
  power: string;
  powerWatts: number;
  battery: string;
  autonomy: string;
  autonomyKm: number;
  maxSpeed: string;
  chargingTime: string;
  maxWeight: string;
  brakes: string;
  inStock: boolean;
  stockQuantity: number;
  isFeatured?: boolean;
  isOffer?: boolean;
  isPublished?: boolean;
  brand?: string;
  badge?: string;
  images: string[];
  description: string;
  features: string[];
  warranty: string;
  category: 'Urbana' | 'Performance' | 'Sport' | 'Carga' | 'Utilitária' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
}

export interface AdminStats {
  totalProducts: number;
  publishedProducts: number;
  hiddenProducts: number;
  totalStockQuantity: number;
  totalStockValue: number;
  featuredCount: number;
  totalOrders: number;
  approvedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  approvedRevenue: number;
  pixRevenue: number;
  cardRevenue: number;
}

export interface CartItem {
  scooter: Scooter;
  quantity: number;
  selectedColor?: string;
}

export interface OrderCustomer {
  name: string;
  cpf: string;
  phone: string;
  whatsapp: string;
  email: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: 'pix' | 'credit_card' | 'boleto';
  installments?: number;
  status: 'Pendente' | 'Aprovado' | 'Em Separação' | 'Enviado' | 'Entregue' | 'Cancelado';
  pixCode?: string;
  notes?: string;
}

export interface StoreSettings {
  officialApkUrl: string;
  officialWhatsApp: string;
  businessName: string;
  tradeName: string;
  cnpj: string;
  phoneDisplay: string;
  email: string;
  address: string;
  cityState: string;
  pixKey: string;
  customPixQrCodeUrl?: string;
  customPixCopiaECola?: string;
  announcementBanner: string;
  heroHeadline: string;
  heroSubtitle: string;
  instagramUrl: string;
  youtubeUrl: string;
}
