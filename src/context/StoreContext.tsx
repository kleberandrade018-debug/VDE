import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Scooter, CartItem, Order, StoreSettings } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialProducts';
import { api } from '../services/api';
import { generatePixCode } from '../utils/formatters';

interface StoreContextType {
  products: Scooter[];
  settings: StoreSettings;
  cart: CartItem[];
  orders: Order[];
  selectedProduct: Scooter | null;
  setSelectedProduct: (scooter: Scooter | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isApkModalOpen: boolean;
  setIsApkModalOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isPolicyModal: 'terms' | 'privacy' | 'warranty' | 'shipping' | null;
  setIsPolicyModal: (policy: 'terms' | 'privacy' | 'warranty' | 'shipping' | null) => void;
  completedOrder: Order | null;
  setCompletedOrder: (order: Order | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Cart actions
  addToCart: (scooter: Scooter, quantity?: number, selectedColor?: string) => void;
  removeFromCart: (scooterId: string) => void;
  updateCartQuantity: (scooterId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartItemsCount: number;

  // Admin actions
  addProduct: (scooter: Scooter) => Promise<void>;
  updateProduct: (scooter: Scooter) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductStatus: (id: string, isPublished: boolean) => Promise<void>;
  resetDefaultCatalog: () => void;
  refreshProducts: () => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], notes?: string) => Promise<void> | void;
  deleteOrder: (orderId: string) => Promise<void> | void;
  clearAllOrders: () => Promise<void> | void;

  // Checkout action
  submitOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;

  // APK Trigger
  triggerApkDownload: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load products from localStorage or default
  const [products, setProducts] = useState<Scooter[]>(() => {
    try {
      const saved = localStorage.getItem('vde_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Load settings from localStorage or default
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('vde_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.officialWhatsApp === '5511987654321' || !parsed.officialWhatsApp) {
          parsed.officialWhatsApp = '5511972040833';
          parsed.phoneDisplay = '(11) 97204-0833';
        }
        if (parsed.pixKey === 'pix@vaideeletrica.com.br' && INITIAL_SETTINGS.pixKey) {
          parsed.pixKey = INITIAL_SETTINGS.pixKey;
        }
        if ((!parsed.customPixQrCodeUrl || parsed.customPixQrCodeUrl === '/uploads/scooter-qrcode-pix-1791908979754-793307754.png') && INITIAL_SETTINGS.customPixQrCodeUrl) {
          parsed.customPixQrCodeUrl = INITIAL_SETTINGS.customPixQrCodeUrl;
        }
        if (!parsed.customPixCopiaECola && INITIAL_SETTINGS.customPixCopiaECola) {
          parsed.customPixCopiaECola = INITIAL_SETTINGS.customPixCopiaECola;
        }
        return parsed;
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Live Sync Settings with Backend Database API
  const refreshSettings = useCallback(async () => {
    try {
      const serverSettings = await api.getSettings();
      if (serverSettings) {
        setSettings(serverSettings);
        localStorage.setItem('vde_settings', JSON.stringify(serverSettings));
      }
    } catch {
      // Keep local state
    }
  }, []);

  useEffect(() => {
    refreshSettings();

    const handleSettingsUpdate = () => {
      refreshSettings();
    };

    window.addEventListener('vde:settings-updated', handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);
    return () => {
      window.removeEventListener('vde:settings-updated', handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
    };
  }, [refreshSettings]);

  // Live Sync Products with Backend Database API
  const refreshProducts = useCallback(async () => {
    try {
      const serverProducts = await api.getProducts();
      if (Array.isArray(serverProducts) && serverProducts.length > 0) {
        setProducts(serverProducts);
        localStorage.setItem('vde_products', JSON.stringify(serverProducts));
      }
    } catch {
      // Fallback to local state if backend is booting
    }
  }, []);

  useEffect(() => {
    refreshProducts();

    const handleProductUpdate = () => {
      refreshProducts();
    };

    window.addEventListener('vde:products-updated', handleProductUpdate);
    return () => {
      window.removeEventListener('vde:products-updated', handleProductUpdate);
    };
  }, [refreshProducts]);

  // Load cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('vde_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load orders from localStorage
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('vde_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [selectedProduct, setSelectedProduct] = useState<Scooter | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPolicyModal, setIsPolicyModal] = useState<'terms' | 'privacy' | 'warranty' | 'shipping' | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist state updates
  useEffect(() => {
    localStorage.setItem('vde_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('vde_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('vde_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vde_orders', JSON.stringify(orders));
  }, [orders]);

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => {
    const unitPrice = item.scooter.promoPrice ?? item.scooter.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Cart operations
  const addToCart = (scooter: Scooter, quantity = 1, selectedColor = 'Preto Cyber com Neon') => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.scooter.id === scooter.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { scooter, quantity, selectedColor }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (scooterId: string) => {
    setCart((prev) => prev.filter((item) => item.scooter.id !== scooterId));
  };

  const updateCartQuantity = (scooterId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(scooterId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.scooter.id === scooterId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Product CRUD
  const addProduct = async (scooter: Scooter) => {
    try {
      const res = await api.createProduct(scooter);
      const created = res.product || scooter;
      setProducts((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
    } catch {
      setProducts((prev) => [scooter, ...prev]);
    }
  };

  const updateProduct = async (updated: Scooter) => {
    try {
      const res = await api.updateProduct(updated.id, updated);
      const saved = res.product || updated;
      setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      if (selectedProduct?.id === saved.id) {
        setSelectedProduct(saved);
      }
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedProduct?.id === updated.id) {
        setSelectedProduct(updated);
      }
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
    } catch (err) {
      console.warn('API deleteProduct warning:', err);
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
    }
  };

  const toggleProductStatus = async (id: string, isPublished: boolean) => {
    try {
      await api.toggleProductStatus(id, isPublished);
    } catch (err) {
      console.warn('API toggleProductStatus warning:', err);
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPublished } : p))
    );
  };

  const resetDefaultCatalog = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.setItem('vde_products', JSON.stringify(INITIAL_PRODUCTS));
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      try {
        localStorage.setItem('vde_settings', JSON.stringify(merged));
      } catch {}
      return merged;
    });
    window.dispatchEvent(new CustomEvent('vde:settings-updated'));
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], notes?: string) => {
    setOrders((prev) => {
      const updated = prev.map((order) =>
        order.id === orderId ? { ...order, status, notes: notes !== undefined ? notes : order.notes } : order
      );
      try {
        localStorage.setItem('vde_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await api.updateOrderStatus(orderId, status, notes);
    } catch (err) {
      console.warn('API updateOrderStatus sync warning:', err);
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.filter((order) => order.id !== orderId);
      try {
        localStorage.setItem('vde_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await api.deleteOrder(orderId);
    } catch (err) {
      console.warn('API deleteOrder sync warning:', err);
    }
  };

  const clearAllOrders = async () => {
    setOrders([]);
    try {
      localStorage.setItem('vde_orders', JSON.stringify([]));
    } catch {}

    try {
      await api.clearAllOrders();
    } catch (err) {
      console.warn('API clearAllOrders sync warning:', err);
    }
  };

  // Submit Order
  const submitOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `VDE-${randomSuffix}`;

    // Guarantee dynamic Pix code with exact total and admin's Pix key
    const resolvedPixCode = orderData.paymentMethod === 'pix'
      ? (orderData.pixCode || generatePixCode(orderId, orderData.total, settings.pixKey, settings.tradeName || 'VAI DE ELETRICA', 'SAO PAULO'))
      : undefined;

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date().toISOString(),
      status: orderData.paymentMethod === 'pix' ? 'Pendente' : 'Aprovado',
      pixCode: resolvedPixCode,
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('vde_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Send order to backend database
    api.createOrder(newOrder).catch((err) => {
      console.warn('API createOrder sync warning:', err);
    });

    clearCart();
    setCompletedOrder(newOrder);
    setIsCheckoutOpen(false);
    return newOrder;
  };

  // Trigger APK Download
  const triggerApkDownload = () => {
    if (settings.officialApkUrl && settings.officialApkUrl.trim().startsWith('http')) {
      const link = document.createElement('a');
      link.href = settings.officialApkUrl.trim();
      link.download = 'vaideeletrica.apk';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setIsApkModalOpen(true);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        settings,
        cart,
        orders,
        selectedProduct,
        setSelectedProduct,
        isCartOpen,
        setIsCartOpen,
        isApkModalOpen,
        setIsApkModalOpen,
        isAdminOpen,
        setIsAdminOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isPolicyModal,
        setIsPolicyModal,
        completedOrder,
        setCompletedOrder,
        searchQuery,
        setSearchQuery,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartItemsCount,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        resetDefaultCatalog,
        refreshProducts,
        updateSettings,
        updateOrderStatus,
        deleteOrder,
        clearAllOrders,
        submitOrder,
        triggerApkDownload,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
