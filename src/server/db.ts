import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Scooter, AdminUser, AdminStats, StoreSettings, Order } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialProducts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredAdmin extends AdminUser {
  passwordHash: string;
}

// Atomic file writer
function atomicWriteJson<T>(filePath: string, data: T): void {
  const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, filePath);
}

// Initialize database with seed data if files don't exist
function initDb() {
  // 1. Products
  if (!fs.existsSync(PRODUCTS_FILE)) {
    const seededProducts: Scooter[] = INITIAL_PRODUCTS.map((p) => ({
      ...p,
      isPublished: true,
      brand: 'Vai de Elétrica',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    atomicWriteJson(PRODUCTS_FILE, seededProducts);
  }

  // 2. Admins
  if (!fs.existsSync(ADMINS_FILE)) {
    const defaultEmail = process.env.ADMIN_EMAIL || 'css1377713@gmail.com';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'Soccfuzil171!';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(defaultPassword, salt);

    const initialAdmins: StoredAdmin[] = [
      {
        id: 'admin-01',
        email: defaultEmail.toLowerCase().trim(),
        name: 'Administrador Vai de Elétrica',
        role: 'superadmin',
        passwordHash,
        createdAt: new Date().toISOString()
      }
    ];
    atomicWriteJson(ADMINS_FILE, initialAdmins);
  }

  // 3. Settings
  if (!fs.existsSync(SETTINGS_FILE)) {
    atomicWriteJson(SETTINGS_FILE, INITIAL_SETTINGS);
  }

  // 4. Orders & Sales
  if (!fs.existsSync(ORDERS_FILE)) {
    const seededOrders: Order[] = [
      {
        id: 'VDE-84920',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        customer: {
          name: 'Carlos Eduardo Silva',
          cpf: '284.918.492-38',
          phone: '(11) 98765-4321',
          whatsapp: '(11) 98765-4321',
          email: 'carlos.eduardo@gmail.com',
          cep: '01310-100',
          street: 'Av. Paulista',
          number: '1578',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP'
        },
        items: [
          {
            scooter: INITIAL_PRODUCTS[0],
            quantity: 1
          }
        ],
        subtotal: 4998.90,
        shippingCost: 0,
        discount: 249.95,
        total: 4748.95,
        paymentMethod: 'pix',
        status: 'Aprovado',
        notes: 'Pagamento PIX confirmado e compensado com sucesso. Nota Fiscal emitida.'
      },
      {
        id: 'VDE-92104',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        customer: {
          name: 'Mariana Souza Costa',
          cpf: '394.182.940-12',
          phone: '(21) 99182-3847',
          whatsapp: '(21) 99182-3847',
          email: 'mariana.costa@outlook.com',
          cep: '22041-001',
          street: 'Rua Barata Ribeiro',
          number: '420',
          complement: 'Apto 602',
          neighborhood: 'Copacabana',
          city: 'Rio de Janeiro',
          state: 'RJ'
        },
        items: [
          {
            scooter: INITIAL_PRODUCTS[1],
            quantity: 1
          }
        ],
        subtotal: 6890.00,
        shippingCost: 0,
        discount: 0,
        total: 6890.00,
        paymentMethod: 'credit_card',
        installments: 12,
        status: 'Aprovado',
        notes: 'Cartão de crédito aprovado pela operadora em 12x sem juros.'
      },
      {
        id: 'VDE-71392',
        createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
        customer: {
          name: 'Rafael Lima Mendes',
          cpf: '401.829.384-55',
          phone: '(31) 98492-1092',
          whatsapp: '(31) 98492-1092',
          email: 'rafael.mendes@gmail.com',
          cep: '30140-071',
          street: 'Rua Sergipe',
          number: '1080',
          neighborhood: 'Savassi',
          city: 'Belo Horizonte',
          state: 'MG'
        },
        items: [
          {
            scooter: INITIAL_PRODUCTS[3],
            quantity: 1
          }
        ],
        subtotal: 4299.00,
        shippingCost: 0,
        discount: 214.95,
        total: 4084.05,
        paymentMethod: 'pix',
        status: 'Aprovado',
        notes: 'Pagamento PIX liquidado instantaneamente. Pedido despachado via transportadora.'
      },
      {
        id: 'VDE-60318',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        customer: {
          name: 'Fernanda Ribeiro',
          cpf: '519.283.471-89',
          phone: '(41) 99872-6152',
          whatsapp: '(41) 99872-6152',
          email: 'fernanda.ribeiro@yahoo.com.br',
          cep: '80420-000',
          street: 'Rua Comendador Araújo',
          number: '731',
          neighborhood: 'Batel',
          city: 'Curitiba',
          state: 'PR'
        },
        items: [
          {
            scooter: INITIAL_PRODUCTS[5],
            quantity: 1
          }
        ],
        subtotal: 8470.00,
        shippingCost: 0,
        discount: 423.50,
        total: 8046.50,
        paymentMethod: 'pix',
        status: 'Pendente',
        notes: 'Aguardando confirmação do pagamento via PIX pelo banco.'
      }
    ];
    atomicWriteJson(ORDERS_FILE, seededOrders);
  }
}

initDb();

export class Database {
  // --- Products ---
  static getProducts(includeHidden = false): Scooter[] {
    try {
      if (!fs.existsSync(PRODUCTS_FILE)) return INITIAL_PRODUCTS;
      const content = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const products: Scooter[] = JSON.parse(content);
      if (includeHidden) {
        return products;
      }
      return products.filter((p) => p.isPublished !== false);
    } catch (err) {
      console.error('Error reading products:', err);
      return INITIAL_PRODUCTS;
    }
  }

  static getProductById(id: string): Scooter | undefined {
    const products = this.getProducts(true);
    return products.find((p) => p.id === id || p.slug === id);
  }

  static saveProduct(data: Partial<Scooter> & { name: string; price: number }): Scooter {
    const products = this.getProducts(true);
    const now = new Date().toISOString();

    let product: Scooter;

    if (data.id && products.some((p) => p.id === data.id)) {
      // Update existing
      const index = products.findIndex((p) => p.id === data.id);
      const existing = products[index];

      product = {
        ...existing,
        ...data,
        id: existing.id,
        name: data.name.trim(),
        price: Number(data.price),
        promoPrice: data.promoPrice ? Number(data.promoPrice) : null,
        powerWatts: data.powerWatts ? Number(data.powerWatts) : existing.powerWatts || 1000,
        power: data.power || `${data.powerWatts || 1000}W Brushless`,
        autonomyKm: data.autonomyKm ? Number(data.autonomyKm) : existing.autonomyKm || 50,
        autonomy: data.autonomy || `${data.autonomyKm || 50} km`,
        maxSpeed: data.maxSpeed || existing.maxSpeed || '45 km/h',
        chargingTime: data.chargingTime || existing.chargingTime || '4 a 6 horas',
        battery: data.battery || existing.battery || '60V Lítio Removível',
        brakes: data.brakes || existing.brakes || 'Freios a Disco Dianteiro e Traseiro',
        maxWeight: data.maxWeight || existing.maxWeight || '160 kg',
        warranty: data.warranty || existing.warranty || '12 meses para motor e chassi',
        brand: data.brand || existing.brand || 'Vai de Elétrica',
        model: data.model || `${data.name} Edition`,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : existing.isPublished ?? true,
        isFeatured: Boolean(data.isFeatured),
        isOffer: Boolean(data.isOffer),
        badge: data.badge || '',
        category: data.category || existing.category || 'Urbana',
        stockQuantity: Number(data.stockQuantity ?? existing.stockQuantity ?? 10),
        inStock: Number(data.stockQuantity ?? existing.stockQuantity ?? 10) > 0,
        images: Array.isArray(data.images) && data.images.length > 0 ? data.images : existing.images,
        description: data.description || existing.description || '',
        features: Array.isArray(data.features) ? data.features : existing.features || [],
        updatedAt: now
      };

      products[index] = product;
    } else {
      // Create new
      const newId = data.id || `vde-${Date.now().toString(36)}`;
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      product = {
        id: newId,
        name: data.name.trim(),
        model: data.model || `${data.name} 1000W`,
        slug,
        price: Number(data.price),
        promoPrice: data.promoPrice ? Number(data.promoPrice) : null,
        powerWatts: Number(data.powerWatts || 1000),
        power: data.power || `${data.powerWatts || 1000}W Brushless`,
        autonomyKm: Number(data.autonomyKm || 50),
        autonomy: data.autonomy || `${data.autonomyKm || 50} km`,
        maxSpeed: data.maxSpeed || '45 km/h',
        chargingTime: data.chargingTime || '4 a 6 horas',
        battery: data.battery || '60V Lítio Removível',
        brakes: data.brakes || 'Freios a Disco Dianteiro e Traseiro',
        maxWeight: data.maxWeight || '160 kg',
        warranty: data.warranty || '12 meses para motor e chassi',
        brand: data.brand || 'Vai de Elétrica',
        isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
        isFeatured: Boolean(data.isFeatured),
        isOffer: Boolean(data.isOffer),
        badge: data.badge || '',
        category: data.category || 'Urbana',
        stockQuantity: Number(data.stockQuantity ?? 10),
        inStock: Number(data.stockQuantity ?? 10) > 0,
        images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ['/images/scooter_stake_red.jpg'],
        description: data.description || 'Scooter elétrica de alta performance da Vai de Elétrica.',
        features: Array.isArray(data.features) && data.features.length > 0 ? data.features : [
          'Motor elétrico silencioso e de alto torque',
          'Bateria de lítio de longa duração',
          'Painel digital completo',
          'Freios a disco de alta precisão'
        ],
        createdAt: now,
        updatedAt: now
      };

      products.unshift(product);
    }

    atomicWriteJson(PRODUCTS_FILE, products);
    return product;
  }

  static toggleProductStatus(id: string, isPublished: boolean): Scooter | null {
    const products = this.getProducts(true);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    products[index].isPublished = isPublished;
    products[index].updatedAt = new Date().toISOString();

    atomicWriteJson(PRODUCTS_FILE, products);
    return products[index];
  }

  static deleteProduct(id: string): boolean {
    const products = this.getProducts(true);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return false;

    products.splice(index, 1);
    atomicWriteJson(PRODUCTS_FILE, products);
    return true;
  }

  static getStats(): AdminStats {
    const all = this.getProducts(true);
    const published = all.filter((p) => p.isPublished !== false);
    const hidden = all.filter((p) => p.isPublished === false);

    const totalStockQuantity = all.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
    const totalStockValue = all.reduce((acc, p) => acc + (p.price * (p.stockQuantity || 0)), 0);
    const featuredCount = all.filter((p) => p.isFeatured).length;

    const orders = this.getOrders();
    const approvedOrders = orders.filter(
      (o) => o.status === 'Aprovado' || o.status === 'Em Separação' || o.status === 'Enviado' || o.status === 'Entregue'
    );
    const pendingOrders = orders.filter((o) => o.status === 'Pendente');

    const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const approvedRevenue = approvedOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const pixRevenue = approvedOrders
      .filter((o) => o.paymentMethod === 'pix')
      .reduce((acc, o) => acc + (o.total || 0), 0);
    const cardRevenue = approvedOrders
      .filter((o) => o.paymentMethod === 'credit_card')
      .reduce((acc, o) => acc + (o.total || 0), 0);

    return {
      totalProducts: all.length,
      publishedProducts: published.length,
      hiddenProducts: hidden.length,
      totalStockQuantity,
      totalStockValue,
      featuredCount,
      totalOrders: orders.length,
      approvedOrders: approvedOrders.length,
      pendingOrders: pendingOrders.length,
      totalRevenue,
      approvedRevenue,
      pixRevenue,
      cardRevenue
    };
  }

  // --- Admin Auth ---
  static getAdmins(): StoredAdmin[] {
    try {
      if (!fs.existsSync(ADMINS_FILE)) return [];
      const content = fs.readFileSync(ADMINS_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  static findAdminByEmail(email: string): StoredAdmin | undefined {
    const admins = this.getAdmins();
    const cleanEmail = email.toLowerCase().trim();
    return admins.find((a) => a.email.toLowerCase() === cleanEmail);
  }

  static verifyAdminPassword(admin: StoredAdmin, candidatePassword: string): boolean {
    return bcrypt.compareSync(candidatePassword, admin.passwordHash);
  }

  static updateAdminPassword(email: string, newPassword: string): boolean {
    const admins = this.getAdmins();
    const index = admins.findIndex((a) => a.email.toLowerCase() === email.toLowerCase().trim());
    if (index === -1) return false;

    const salt = bcrypt.genSaltSync(10);
    admins[index].passwordHash = bcrypt.hashSync(newPassword, salt);
    atomicWriteJson(ADMINS_FILE, admins);
    return true;
  }

  // --- Settings ---
  static getSettings(): StoreSettings {
    try {
      if (!fs.existsSync(SETTINGS_FILE)) return INITIAL_SETTINGS;
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  static saveSettings(updates: Partial<StoreSettings>): StoreSettings {
    const current = this.getSettings();
    const merged = { ...current, ...updates };
    atomicWriteJson(SETTINGS_FILE, merged);
    return merged;
  }

  // --- Orders & Sales ---
  static getOrders(): Order[] {
    try {
      if (!fs.existsSync(ORDERS_FILE)) return [];
      const content = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const orders = JSON.parse(content);
      return Array.isArray(orders) ? orders : [];
    } catch {
      return [];
    }
  }

  static getOrderById(id: string): Order | undefined {
    const orders = this.getOrders();
    return orders.find((o) => o.id === id);
  }

  static saveOrder(data: Partial<Order>): Order {
    const orders = this.getOrders();
    const now = new Date().toISOString();
    const newId = data.id || `VDE-${Math.floor(10000 + Math.random() * 90000)}`;

    const order: Order = {
      id: newId,
      createdAt: data.createdAt || now,
      customer: data.customer!,
      items: data.items || [],
      subtotal: Number(data.subtotal || 0),
      shippingCost: Number(data.shippingCost || 0),
      discount: Number(data.discount || 0),
      total: Number(data.total || 0),
      paymentMethod: data.paymentMethod || 'pix',
      installments: data.installments,
      status: data.status || (data.paymentMethod === 'pix' ? 'Pendente' : 'Aprovado'),
      pixCode: data.pixCode,
      notes: data.notes
    };

    const existingIndex = orders.findIndex((o) => o.id === newId);
    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.unshift(order);
    }

    atomicWriteJson(ORDERS_FILE, orders);
    return order;
  }

  static updateOrderStatus(id: string, status: Order['status'], notes?: string): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return null;

    orders[index].status = status;
    if (notes !== undefined) {
      orders[index].notes = notes;
    }
    atomicWriteJson(ORDERS_FILE, orders);
    return orders[index];
  }

  static deleteOrder(id: string): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return false;

    orders.splice(index, 1);
    atomicWriteJson(ORDERS_FILE, orders);
    return true;
  }

  static clearOrders(): boolean {
    atomicWriteJson(ORDERS_FILE, []);
    return true;
  }
}
