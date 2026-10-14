import React, { useState, useEffect, useRef } from 'react';
import { api, authStorage } from '../services/api';
import { Scooter, AdminUser, AdminStats, Order } from '../types';
import { useStore } from '../context/StoreContext';
import { formatBRL, formatCPF, formatPhone, generatePixCode, generatePixQRCodeDataUrl, getPixQrCodeUrl } from '../utils/formatters';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  ArrowLeft,
  LogOut,
  Zap,
  Package,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon,
  QrCode,
  ShoppingBag,
  DollarSign,
  CreditCard,
  Clock,
  Truck,
  CheckCheck,
  FileText,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  Filter,
  Copy
} from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const AdminDashboardPage: React.FC<{ onBackToStore: () => void }> = ({ onBackToStore }) => {
  const { refreshProducts, settings, updateSettings, deleteOrder, clearAllOrders } = useStore();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Products & Stats State
  const [products, setProducts] = useState<Scooter[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Active Dashboard Tab ('sales' | 'catalog')
  const [activeTab, setActiveTab] = useState<'sales' | 'catalog'>('sales');

  // Orders & Sales State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<string>('all');
  const [ordersPaymentFilter, setOrdersPaymentFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [isClearOrdersModalOpen, setIsClearOrdersModalOpen] = useState(false);

  // Filters & Search (Catalog)
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden'>('all');

  // Modal: Form (Create/Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Scooter> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal: Delete Confirmation
  const [productToDelete, setProductToDelete] = useState<Scooter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal: PIX Configuration
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [pixKeyInput, setPixKeyInput] = useState('');
  const [pixQrUrlInput, setPixQrUrlInput] = useState('');
  const [pixCopiaEColaInput, setPixCopiaEColaInput] = useState('');
  const [isSavingPix, setIsSavingPix] = useState(false);
  const [isUploadingPix, setIsUploadingPix] = useState(false);
  const pixFileInputRef = useRef<HTMLInputElement>(null);
  const [simulatedPixAmount, setSimulatedPixAmount] = useState<number>(9499.05);
  const [simulatedQrUrl, setSimulatedQrUrl] = useState<string>('');

  // Live dynamic QR Code preview generator for the Admin simulator
  useEffect(() => {
    if (isPixModalOpen) {
      let active = true;
      const testCode = generatePixCode(
        'TESTE',
        simulatedPixAmount,
        pixKeyInput || '8f0cc2dd-dac2-47e4-a824-09be9f10cd21',
        settings.tradeName || 'VAI DE ELETRICA',
        'SAO PAULO'
      );
      generatePixQRCodeDataUrl(testCode).then((url) => {
        if (active) setSimulatedQrUrl(url);
      });
      return () => {
        active = false;
      };
    }
  }, [isPixModalOpen, pixKeyInput, simulatedPixAmount, settings.tradeName]);

  // Notifications (Toasts)
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // 1. Check Authentication on Mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = authStorage.getToken();
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }
      try {
        const res = await api.getMe();
        setCurrentUser(res.user);
      } catch {
        authStorage.removeToken();
        setCurrentUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // 2. Load Products, Orders & Stats when Authenticated
  const loadAdminData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const [allProducts, statsData, allOrders] = await Promise.all([
        api.getAllAdminProducts(),
        api.getStats().catch(() => null),
        api.getOrders().catch(() => [])
      ]);
      setProducts(allProducts);
      setStats(statsData);
      setOrders(allOrders);
    } catch (err: any) {
      addToast('error', err.message || 'Erro ao carregar dados do painel.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update Order Status / Confirm Payment
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status'], notes?: string) => {
    setIsUpdatingOrder(true);
    try {
      const res = await api.updateOrderStatus(orderId, newStatus, notes);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? res.order || { ...o, status: newStatus, notes: notes ?? o.notes } : o))
      );
      if (selectedOrderDetails?.id === orderId) {
        setSelectedOrderDetails(res.order || { ...selectedOrderDetails, status: newStatus, notes: notes ?? selectedOrderDetails.notes });
      }
      addToast(
        'success',
        newStatus === 'Aprovado'
          ? `Pagamento do pedido ${orderId} CONFIRMADO COM SUCESSO! Valor liberado.`
          : `Status do pedido ${orderId} atualizado para "${newStatus}".`
      );
      api.getStats().then(setStats).catch(() => {});
    } catch (err: any) {
      addToast('error', err.message || 'Erro ao atualizar pedido.');
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Delete a specific order
  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    const targetId = orderToDelete.id;
    setIsDeletingOrder(true);
    try {
      await api.deleteOrder(targetId);
      deleteOrder(targetId);
      setOrders((prev) => prev.filter((o) => o.id !== targetId));
      if (selectedOrderDetails?.id === targetId) {
        setSelectedOrderDetails(null);
      }
      setOrderToDelete(null);
      addToast('success', `Pedido ${targetId} apagado com sucesso!`);
      api.getStats().then(setStats).catch(() => {});
    } catch (err: any) {
      addToast('error', err.message || 'Erro ao apagar pedido.');
    } finally {
      setIsDeletingOrder(false);
    }
  };

  // Clear all orders
  const handleConfirmClearAllOrders = async () => {
    setIsDeletingOrder(true);
    try {
      await api.clearAllOrders();
      clearAllOrders();
      setOrders([]);
      setSelectedOrderDetails(null);
      setIsClearOrdersModalOpen(false);
      addToast('success', 'Todos os pedidos foram apagados com sucesso!');
      api.getStats().then(setStats).catch(() => {});
    } catch (err: any) {
      addToast('error', err.message || 'Erro ao apagar pedidos.');
    } finally {
      setIsDeletingOrder(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAdminData();
    }
  }, [currentUser]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await api.login(loginEmail, loginPassword);
      setCurrentUser(res.user);
      addToast('success', `Bem-vindo, ${res.user.name}! Painel administrativo conectado.`);
    } catch (err: any) {
      addToast('error', err.message || 'Falha ao autenticar.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    addToast('info', 'Sessão encerrada com sucesso.');
  };


  // Handle Image Upload with instant preview and resilient server persistence
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif', '.bmp', '.svg', '.avif'];
    const fileName = (file.name || '').toLowerCase();
    const isImage = (file.type && file.type.startsWith('image/')) || allowedExts.some((ext) => fileName.endsWith(ext));

    if (!isImage) {
      addToast('error', 'Por favor, selecione uma imagem válida (JPG, PNG, WEBP, GIF, HEIC).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      addToast('error', 'A imagem deve ter no máximo 25MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(`Processando ${file.name}...`);

    // 1. Read preview first
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve((event.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });

    if (dataUrl) {
      setEditingProduct((prev) => {
        if (!prev) return prev;
        const currentImgs = prev.images ? [...prev.images] : [];
        if (currentImgs.length > 0) {
          currentImgs[0] = dataUrl;
        } else {
          currentImgs.push(dataUrl);
        }
        return {
          ...prev,
          images: currentImgs
        };
      });
    }

    setUploadProgress('Salvando no servidor...');

    // 2. Upload to server for permanent static URL storage
    try {
      const res = await api.uploadImage(file);
      if (res && res.url) {
        setEditingProduct((prev) => {
          if (!prev) return prev;
          const currentImgs = prev.images ? [...prev.images] : [];
          currentImgs[0] = res.url;
          return {
            ...prev,
            images: currentImgs
          };
        });
        addToast('success', 'Fotografia salva no servidor com sucesso!');
      }
    } catch (err: any) {
      console.warn('Upload to /api/upload warning, using visual preview:', err);
      addToast('info', 'Imagem carregada com sucesso na prévia do modelo!');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Open PIX Modal populated with current settings
  const handleOpenPixModal = async () => {
    setPixKeyInput(settings.pixKey || '');
    setPixQrUrlInput(settings.customPixQrCodeUrl || '/images/pix_qrcode.png');
    setPixCopiaEColaInput(settings.customPixCopiaECola || '');
    setIsPixModalOpen(true);

    try {
      const serverSettings = await api.getSettings();
      if (serverSettings) {
        if (serverSettings.pixKey) setPixKeyInput(serverSettings.pixKey);
        if (serverSettings.customPixQrCodeUrl) setPixQrUrlInput(serverSettings.customPixQrCodeUrl);
        if (serverSettings.customPixCopiaECola) setPixCopiaEColaInput(serverSettings.customPixCopiaECola);
      }
    } catch {
      // Keep local state
    }
  };

  // Handle PIX QR Code image upload
  const handlePixFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPix(true);

    // 1. Immediate visual preview
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve((event.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });

    if (dataUrl) {
      setPixQrUrlInput(dataUrl);
    }

    // 2. Upload to server
    try {
      const res = await api.uploadImage(file);
      if (res && res.url) {
        setPixQrUrlInput(res.url);
        addToast('success', 'Imagem do QR Code Pix salva com sucesso no servidor!');
      }
    } catch {
      addToast('info', 'Imagem do QR Code carregada na prévia!');
    } finally {
      setIsUploadingPix(false);
      if (pixFileInputRef.current) pixFileInputRef.current.value = '';
    }
  };

  // Save PIX Settings
  const handleSavePixSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPix(true);
    try {
      const newSettings = {
        pixKey: pixKeyInput.trim(),
        customPixQrCodeUrl: pixQrUrlInput.trim(),
        customPixCopiaECola: pixCopiaEColaInput.trim(),
      };
      await api.updateSettings(newSettings);
      updateSettings(newSettings);
      addToast('success', 'Configurações do PIX salvas com sucesso! O checkout já exibe o novo QR Code.');
      setIsPixModalOpen(false);
    } catch (err: any) {
      addToast('error', err.message || 'Erro ao salvar configurações do PIX.');
    } finally {
      setIsSavingPix(false);
    }
  };

  // Toggle Published / Hidden status
  const handleTogglePublish = async (product: Scooter) => {
    const newStatus = !(product.isPublished !== false);
    try {
      await api.toggleProductStatus(product.id, newStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isPublished: newStatus } : p))
      );
      if (stats) {
        setStats({
          ...stats,
          publishedProducts: stats.publishedProducts + (newStatus ? 1 : -1),
          hiddenProducts: stats.hiddenProducts + (newStatus ? -1 : 1)
        });
      }
      refreshProducts();
      addToast(
        'success',
        newStatus
          ? `Scooter "${product.name}" agora está visível no site público.`
          : `Scooter "${product.name}" foi ocultada do site público.`
      );
    } catch (err: any) {
      addToast('error', err.message || 'Erro ao alterar visibilidade.');
    }
  };

  // Open Form for Create
  const handleOpenCreate = () => {
    setEditingProduct({
      id: '',
      name: '',
      model: '',
      slug: '',
      brand: 'Vai de Elétrica',
      price: 0,
      promoPrice: null,
      powerWatts: 1000,
      power: '1000W Brushless High Efficiency',
      autonomyKm: 50,
      autonomy: 'Até 50 km',
      maxSpeed: '45 km/h',
      chargingTime: '4 a 6 horas',
      battery: '60V 20Ah Lítio Removível',
      brakes: 'Freios a Disco Dianteiro e Traseiro',
      maxWeight: '160 kg',
      warranty: '12 meses para motor e chassi; 6 meses para bateria',
      category: 'Urbana',
      stockQuantity: 10,
      inStock: true,
      isPublished: true,
      isFeatured: false,
      isOffer: false,
      badge: '',
      images: ['/images/scooter_stake_red.jpg'],
      description: 'Scooter elétrica moderna e econômica da Vai de Elétrica.',
      features: [
        'Motor elétrico de alta eficiência',
        'Bateria de lítio com recarga rápida',
        'Painel digital completo',
        'Iluminação frontal em LED'
      ]
    });
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEdit = (product: Scooter) => {
    setEditingProduct({
      ...product,
      brand: product.brand || 'Vai de Elétrica',
      isPublished: product.isPublished !== false,
      images: product.images && product.images.length > 0 ? [...product.images] : ['/images/scooter_stake_red.jpg']
    });
    setIsFormOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.price) {
      addToast('error', 'Preencha o nome do modelo e um preço válido.');
      return;
    }

    setIsSaving(true);
    try {
      const isEditing = Boolean(editingProduct.id && products.some((p) => p.id === editingProduct.id));

      if (isEditing) {
        const res = await api.updateProduct(editingProduct.id!, editingProduct);
        setProducts((prev) => prev.map((p) => (p.id === res.product.id ? res.product : p)));
        addToast('success', `Scooter "${res.product.name}" atualizada com sucesso! O site já reflete as alterações.`);
      } else {
        const res = await api.createProduct(editingProduct);
        setProducts((prev) => [res.product, ...prev]);
        addToast('success', `Scooter "${res.product.name}" cadastrada com sucesso e publicada na loja!`);
      }

      setIsFormOpen(false);
      setEditingProduct(null);
      refreshProducts();
      // Reload stats
      api.getStats().then(setStats).catch(() => {});
    } catch (err: any) {
      addToast('error', err.message || 'Erro ao salvar scooter.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Product
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      addToast('success', `Scooter "${productToDelete.name}" foi excluída com sucesso.`);
      setProductToDelete(null);
      refreshProducts();
      // Reload stats
      api.getStats().then(setStats).catch(() => {});
    } catch (err: any) {
      addToast('error', err.message || 'Erro ao excluir produto.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.power && p.power.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && p.isPublished !== false) ||
      (statusFilter === 'hidden' && p.isPublished === false);

    return matchSearch && matchCategory && matchStatus;
  });

  // Filtered Orders for Sales & Payments View
  const filteredOrders = orders.filter((o) => {
    const query = ordersSearch.toLowerCase().trim();
    const matchSearch =
      query === '' ||
      o.id.toLowerCase().includes(query) ||
      o.customer.name.toLowerCase().includes(query) ||
      o.customer.cpf.includes(query) ||
      o.customer.whatsapp.includes(query) ||
      o.items.some((i) => i.scooter.name.toLowerCase().includes(query));

    const matchStatus =
      ordersStatusFilter === 'all' ||
      (ordersStatusFilter === 'Aprovado' && (o.status === 'Aprovado' || o.status === 'Em Separação' || o.status === 'Enviado' || o.status === 'Entregue')) ||
      o.status === ordersStatusFilter;

    const matchPayment =
      ordersPaymentFilter === 'all' || o.paymentMethod === ordersPaymentFilter;

    return matchSearch && matchStatus && matchPayment;
  });

  // Approved sales calculations
  const approvedOrdersList = orders.filter(
    (o) => o.status === 'Aprovado' || o.status === 'Em Separação' || o.status === 'Enviado' || o.status === 'Entregue'
  );
  const totalApprovedRevenue = approvedOrdersList.reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingOrdersList = orders.filter((o) => o.status === 'Pendente');
  const pixApprovedOrders = approvedOrdersList.filter((o) => o.paymentMethod === 'pix');
  const pixRevenueSum = pixApprovedOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const cardApprovedOrders = approvedOrdersList.filter((o) => o.paymentMethod === 'credit_card');
  const cardRevenueSum = cardApprovedOrders.reduce((acc, o) => acc + (o.total || 0), 0);

  // Loading Screen while verifying JWT
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-mono-tech text-sm tracking-wider">Verificando credenciais de acesso...</p>
      </div>
    );
  }

  // --- LOGIN SCREEN ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#39FF14]/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Back to store button */}
        <button
          onClick={onBackToStore}
          className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2 text-sm transition py-2 px-3 rounded-xl bg-[#121212] border border-[#222]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Loja Pública</span>
        </button>

        {/* Login Card */}
        <div className="w-full max-w-md bg-[#111111] border border-[#242424] rounded-3xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative z-10 animate-in fade-in duration-300">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#182618] border border-[#39FF14]/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(57,255,20,0.2)]">
              <Shield className="w-7 h-7 text-[#39FF14]" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wider font-heading uppercase">
              Vai de Elétrica
            </h1>
            <p className="text-xs text-[#39FF14] font-mono-tech font-bold uppercase tracking-widest mt-1">
              Back-End Administrativo
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Autenticação segura de gestão do catálogo e estoque.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                E-mail do Administrador
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 transition outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-600 transition outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 py-3.5 bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-sm uppercase tracking-wider rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                  <span>Acessar Painel</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Toast notifications */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-xl border text-xs shadow-lg flex items-center gap-2.5 animate-in slide-in-from-bottom-2 ${
                t.type === 'success'
                  ? 'bg-[#152415] border-[#39FF14]/50 text-[#39FF14]'
                  : t.type === 'error'
                  ? 'bg-[#2a1515] border-red-500/50 text-red-400'
                  : 'bg-[#181818] border-gray-700 text-gray-200'
              }`}
            >
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {t.type === 'error' && <XCircle className="w-4 h-4 shrink-0" />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-[#111111] border-b border-[#202020] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#182618] border border-[#39FF14]/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#39FF14]" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider font-heading uppercase text-white block">
                Vai de Elétrica
              </span>
              <span className="text-[10px] text-[#39FF14] font-mono-tech font-bold uppercase tracking-widest block">
                Painel Administrativo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="px-3.5 py-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Loja Pública</span>
            </button>

            <div className="h-6 w-[1px] bg-[#252525] hidden sm:block" />

            <div className="hidden md:flex flex-col items-end text-xs">
              <span className="font-bold text-gray-200">{currentUser.name}</span>
              <span className="text-[10px] text-gray-500 font-mono-tech">{currentUser.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#202020] pb-4">
          <div className="flex items-center gap-2 bg-[#121212] p-1.5 rounded-2xl border border-[#262626]">
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'sales'
                  ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <DollarSign className="w-4 h-4 stroke-[2.5]" />
              <span>Vendas & Pagamentos</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'sales' ? 'bg-black text-[#39FF14]' : 'bg-[#222] text-gray-300'
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-[#39FF14] text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Package className="w-4 h-4 stroke-[2.5]" />
              <span>Modelos & Scooters</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'catalog' ? 'bg-black text-[#39FF14]' : 'bg-[#222] text-gray-300'
              }`}>
                {products.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              disabled={isLoading}
              className="px-3.5 py-2.5 bg-[#141414] hover:bg-[#1e1e1e] border border-[#2a2a2a] text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
              title="Recarregar Dados"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#39FF14]' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              onClick={handleOpenPixModal}
              className="px-3.5 py-2.5 bg-[#141414] hover:bg-[#1e1e1e] border border-[#39FF14]/40 hover:border-[#39FF14] text-[#39FF14] font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm"
              title="Configurar QR Code e Chave Pix"
            >
              <QrCode className="w-4 h-4 stroke-[2.5]" />
              <span>Configurar PIX</span>
            </button>
          </div>
        </div>

        {/* TAB 1: VENDAS & PAGAMENTOS */}
        {activeTab === 'sales' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Sales Financial KPI Cards */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#121212] border border-[#222] p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Faturamento Confirmado</span>
                  <div className="w-8 h-8 rounded-lg bg-green-950/60 border border-green-500/40 flex items-center justify-center text-green-400">
                    <DollarSign className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#39FF14] font-mono-tech">
                  {formatBRL(totalApprovedRevenue)}
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {approvedOrdersList.length} pagamentos confirmados com sucesso
                </span>
              </div>

              <div className="bg-[#121212] border border-[#222] p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Recebido via PIX</span>
                  <div className="w-8 h-8 rounded-lg bg-[#182618] border border-[#39FF14]/40 flex items-center justify-center text-[#39FF14]">
                    <QrCode className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-tech">
                  {formatBRL(pixRevenueSum)}
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {pixApprovedOrders.length} vendas via Pix à vista (-5% OFF)
                </span>
              </div>

              <div className="bg-[#121212] border border-[#222] p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Cartão / Parcelado</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono-tech">
                  {formatBRL(cardRevenueSum)}
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {cardApprovedOrders.length} vendas aprovadas no cartão
                </span>
              </div>

              <div className="bg-[#121212] border border-[#222] p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Aguardando Pagamento</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono-tech">
                  {pendingOrdersList.length}
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  {formatBRL(pendingOrdersList.reduce((acc, o) => acc + (o.total || 0), 0))} em aberto
                </span>
              </div>
            </section>

            {/* Sales Search & Filter Toolbar */}
            <section className="bg-[#121212] border border-[#202020] p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar venda por código (ex: VDE-84920), nome do cliente, CPF ou WhatsApp..."
                  value={ordersSearch}
                  onChange={(e) => setOrdersSearch(e.target.value)}
                  className="w-full bg-[#181818] border border-[#282828] focus:border-[#39FF14] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={ordersStatusFilter}
                  onChange={(e) => setOrdersStatusFilter(e.target.value)}
                  className="bg-[#181818] border border-[#282828] text-gray-300 text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
                >
                  <option value="all">Todos os Status ({orders.length})</option>
                  <option value="Aprovado">Pagamentos Aprovados ({approvedOrdersList.length})</option>
                  <option value="Pendente">Pagamentos Pendentes ({pendingOrdersList.length})</option>
                  <option value="Em Separação">Em Separação</option>
                  <option value="Enviado">Enviados</option>
                  <option value="Entregue">Entregues</option>
                  <option value="Cancelado">Cancelados</option>
                </select>

                <select
                  value={ordersPaymentFilter}
                  onChange={(e) => setOrdersPaymentFilter(e.target.value)}
                  className="bg-[#181818] border border-[#282828] text-gray-300 text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
                >
                  <option value="all">Todas Formas de Pagamento</option>
                  <option value="pix">Apenas PIX</option>
                  <option value="credit_card">Apenas Cartão de Crédito</option>
                  <option value="boleto">Apenas Boleto</option>
                </select>

                <button
                  onClick={loadAdminData}
                  disabled={isLoading}
                  className="p-2.5 bg-[#181818] hover:bg-[#222] border border-[#282828] text-gray-300 rounded-xl transition cursor-pointer"
                  title="Atualizar Vendas"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#39FF14]' : ''}`} />
                </button>

                {orders.length > 0 && (
                  <button
                    onClick={() => setIsClearOrdersModalOpen(true)}
                    className="px-3.5 py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 hover:text-red-300 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
                    title="Apagar todos os pedidos do histórico"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Limpar Pedidos</span>
                  </button>
                )}
              </div>
            </section>

            {/* Orders List / Cards */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                    <span>Vendas Realizadas & Pagamentos</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#39FF14]/20 text-[#39FF14] font-mono-tech font-bold">
                      {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Histórico detalhado de pedidos, confirmações de pagamento e dados de clientes.
                  </p>
                </div>

                <div className="text-xs text-right hidden sm:block">
                  <span className="text-gray-400">Total listado: </span>
                  <span className="font-bold text-[#39FF14] font-mono-tech">
                    {formatBRL(filteredOrders.reduce((acc, o) => acc + (o.total || 0), 0))}
                  </span>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-[#121212] border border-[#202020] rounded-2xl p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-gray-300">Nenhum pedido encontrado</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Não foram encontradas vendas com os filtros selecionados.
                  </p>
                  {(ordersSearch || ordersStatusFilter !== 'all' || ordersPaymentFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setOrdersSearch('');
                        setOrdersStatusFilter('all');
                        setOrdersPaymentFilter('all');
                      }}
                      className="mt-4 px-4 py-2 bg-[#202020] hover:bg-[#282828] text-xs font-semibold text-gray-300 rounded-xl transition cursor-pointer"
                    >
                      Limpar Filtros
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => {
                    const isApproved =
                      order.status === 'Aprovado' ||
                      order.status === 'Em Separação' ||
                      order.status === 'Enviado' ||
                      order.status === 'Entregue';
                    const isPending = order.status === 'Pendente';
                    const dateFormatted = new Date(order.createdAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    const rawPhone = order.customer.whatsapp || order.customer.phone || '';
                    const digits = rawPhone.replace(/\D/g, '');
                    const phone = digits.startsWith('55') ? digits : `55${digits}`;

                    return (
                      <div
                        key={order.id}
                        className={`bg-[#121212] border rounded-2xl p-5 transition-all space-y-4 ${
                          isApproved
                            ? 'border-[#39FF14]/30 hover:border-[#39FF14]/60'
                            : isPending
                            ? 'border-amber-500/30 hover:border-amber-500/60 bg-[#14120f]'
                            : 'border-[#222] hover:border-[#333]'
                        }`}
                      >
                        {/* Order Top Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#202020]">
                          <div className="flex items-center gap-3">
                            <span className="font-mono-tech font-black text-sm text-white">
                              {order.id}
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono-tech">
                              <Calendar className="w-3.5 h-3.5 text-gray-500" />
                              {dateFormatted}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Payment Method Badge */}
                            {order.paymentMethod === 'pix' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#182618] border border-[#39FF14]/40 text-[#39FF14]">
                                <QrCode className="w-3 h-3 stroke-[2.5]" />
                                PIX (5% OFF)
                              </span>
                            ) : order.paymentMethod === 'credit_card' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-950/50 border border-blue-500/30 text-blue-400">
                                <CreditCard className="w-3 h-3" />
                                Cartão {order.installments ? `${order.installments}x` : 'à vista'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-800/60 border border-gray-700 text-gray-300">
                                <FileText className="w-3 h-3" />
                                Boleto Bancário
                              </span>
                            )}

                            {/* Payment Status Badge */}
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                                Pagamento Aprovado
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-amber-950/70 border border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                Pagamento Pendente
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-800 text-gray-300">
                                {order.status}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* Col 1: Customer Data */}
                          <div className="space-y-1 bg-[#161616] p-3.5 rounded-xl border border-[#242424]">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                              Cliente
                            </span>
                            <div className="font-bold text-white text-sm">
                              {order.customer.name}
                            </div>
                            <div className="text-gray-400 text-[11px] font-mono-tech">
                              CPF: {formatCPF(order.customer.cpf)}
                            </div>
                            <div className="text-gray-400 text-[11px]">
                              {order.customer.city} / {order.customer.state}
                            </div>
                            <div className="pt-1 flex items-center gap-2">
                              <a
                                href={`https://wa.me/${phone}?text=${encodeURIComponent(
                                  `Olá ${order.customer.name.split(' ')[0]}! Aqui é da Vai de Elétrica sobre o seu pedido ${order.id}.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-[11px] text-[#39FF14] hover:underline font-semibold"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>WhatsApp: {formatPhone(order.customer.whatsapp)}</span>
                              </a>
                            </div>
                          </div>

                          {/* Col 2: Products Purchased */}
                          <div className="space-y-2 bg-[#161616] p-3.5 rounded-xl border border-[#242424]">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                              Itens Comprados ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
                            </span>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2.5">
                                  {item.scooter.images?.[0] ? (
                                    <img
                                      src={item.scooter.images[0]}
                                      alt={item.scooter.name}
                                      className="w-10 h-10 rounded-lg object-contain bg-black/40 border border-[#333] shrink-0 p-0.5"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-[#222] flex items-center justify-center shrink-0">
                                      <Package className="w-4 h-4 text-gray-500" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-white font-semibold truncate text-[11px]">
                                      {item.quantity}x {item.scooter.name}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-mono-tech">
                                      {formatBRL(item.scooter.promoPrice ?? item.scooter.price)} cada
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Col 3: Totals & Quick Status Action */}
                          <div className="space-y-2.5 bg-[#161616] p-3.5 rounded-xl border border-[#242424] flex flex-col justify-between">
                            <div>
                              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                                Valor Total
                              </span>
                              <div className="text-xl sm:text-2xl font-black text-[#39FF14] font-mono-tech mt-0.5">
                                {formatBRL(order.total)}
                              </div>
                              {order.discount > 0 && (
                                <span className="text-[10px] text-emerald-400 block">
                                  Desconto PIX: -{formatBRL(order.discount)}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400 block">
                                Frete Especial: Grátis
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-1.5 pt-1">
                              {isPending && (
                                <button
                                  type="button"
                                  disabled={isUpdatingOrder}
                                  onClick={() =>
                                    handleUpdateOrderStatus(
                                      order.id,
                                      'Aprovado',
                                      'Pagamento PIX confirmado e validado pelo administrador.'
                                    )
                                  }
                                  className="w-full py-2 px-3 bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(57,255,20,0.3)] cursor-pointer"
                                >
                                  <CheckCheck className="w-3.5 h-3.5 stroke-[2.8]" />
                                  <span>Confirmar Pagamento PIX</span>
                                </button>
                              )}

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderDetails(order)}
                                  className="flex-1 py-1.5 px-3 bg-[#222] hover:bg-[#2c2c2c] text-gray-200 text-[11px] font-semibold rounded-xl border border-[#333] transition cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Ver Detalhes</span>
                                </button>

                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                                  className="bg-[#202020] border border-[#333] text-gray-300 text-[11px] rounded-xl px-2 py-1.5 outline-none cursor-pointer"
                                >
                                  <option value="Pendente">Pendente</option>
                                  <option value="Aprovado">Aprovado</option>
                                  <option value="Em Separação">Em Separação</option>
                                  <option value="Enviado">Enviado</option>
                                  <option value="Entregue">Entregue</option>
                                  <option value="Cancelado">Cancelado</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => setOrderToDelete(order)}
                                  className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/70 border border-red-900/40 hover:border-red-600/60 text-red-400 hover:text-red-200 text-xs transition cursor-pointer flex items-center justify-center shrink-0"
                                  title={`Apagar pedido ${order.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Notes (if present) */}
                        {order.notes && (
                          <div className="text-[11px] text-gray-400 bg-[#0d0d0d] px-3.5 py-2 rounded-xl border border-[#1e1e1e] flex items-center gap-2">
                            <span className="text-[#39FF14] font-bold">Obs:</span>
                            <span className="italic">{order.notes}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: MODELOS & SCOOTERS (CATÁLOGO) */}
        {activeTab === 'catalog' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Metrics Dashboard Cards */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#121212] border border-[#222] p-5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Total Modelos</span>
                  <div className="w-8 h-8 rounded-lg bg-[#182618] border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-tech">
                  {stats?.totalProducts ?? products.length}
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">Scooters cadastradas no sistema</span>
              </div>

          <div className="bg-[#121212] border border-[#222] p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Publicados na Loja</span>
              <div className="w-8 h-8 rounded-lg bg-green-950/60 border border-green-500/40 flex items-center justify-center text-green-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#39FF14] font-mono-tech">
              {stats?.publishedProducts ?? products.filter((p) => p.isPublished !== false).length}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Visíveis para todos os clientes</span>
          </div>

          <div className="bg-[#121212] border border-[#222] p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Modelos Ocultos</span>
              <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <EyeOff className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono-tech">
              {stats?.hiddenProducts ?? products.filter((p) => p.isPublished === false).length}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Rascunhos ou temporariamente fora</span>
          </div>

          <div className="bg-[#121212] border border-[#222] p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Unidades em Estoque</span>
              <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono-tech">
              {stats?.totalStockQuantity ?? products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0)}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Estoque físico disponível</span>
          </div>
        </section>

        {/* Toolbar: Search, Filters & "Adicionar Scooter" */}
        <section className="bg-[#121212] border border-[#202020] p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por modelo, nome ou potência..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181818] border border-[#282828] focus:border-[#39FF14] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#181818] border border-[#282828] text-gray-300 text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
            >
              <option value="all">Todas Categorias</option>
              <option value="Urbana">Urbana</option>
              <option value="Performance">Performance</option>
              <option value="Sport">Sport</option>
              <option value="Carga">Carga</option>
              <option value="Utilitária">Utilitária</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#181818] border border-[#282828] text-gray-300 text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
            >
              <option value="all">Todos Status</option>
              <option value="published">Apenas Publicados</option>
              <option value="hidden">Apenas Ocultos</option>
            </select>

            <button
              onClick={loadAdminData}
              disabled={isLoading}
              className="p-2.5 bg-[#181818] hover:bg-[#222] border border-[#282828] text-gray-300 rounded-xl transition cursor-pointer"
              title="Recarregar catálogo"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#39FF14]' : ''}`} />
            </button>

            {/* PIX Config Button */}
            <button
              onClick={handleOpenPixModal}
              className="px-3.5 py-2.5 bg-[#181818] hover:bg-[#222222] border border-[#39FF14]/40 hover:border-[#39FF14] text-[#39FF14] font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap shadow-sm"
              title="Configurar QR Code e Chave Pix"
            >
              <QrCode className="w-4 h-4 stroke-[2.5]" />
              <span>Configurar PIX</span>
            </button>

            {/* Add Button */}
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.3)] transition cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Adicionar Scooter</span>
            </button>
          </div>
        </section>

        {/* Product Catalog Grid / Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-wide">
              Catálogo de Scooters ({filteredProducts.length})
            </h2>
            <span className="text-xs text-gray-500 font-mono-tech">
              Banco de Dados Persistente
            </span>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Carregando catálogo...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-[#121212] border border-[#202020] rounded-2xl p-12 text-center">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-300">Nenhuma scooter encontrada</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Não há modelos que correspondam à sua pesquisa ou aos filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => {
                const isPublished = product.isPublished !== false;
                const mainImg = product.images?.[0] || '/images/scooter_stake_red.jpg';

                return (
                  <div
                    key={product.id}
                    className={`bg-[#121212] border rounded-2xl p-4 flex flex-col justify-between transition duration-200 relative ${
                      isPublished
                        ? 'border-[#222222] hover:border-[#39FF14]/50'
                        : 'border-[#2a2020] opacity-80 bg-[#120f0f]'
                    }`}
                  >
                    {/* Top Status Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          isPublished
                            ? 'bg-[#182618] text-[#39FF14] border border-[#39FF14]/30'
                            : 'bg-[#2a2a2a] text-gray-400 border border-gray-700'
                        }`}
                      >
                        {isPublished ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Publicado no Site</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Oculto</span>
                          </>
                        )}
                      </span>

                      <span className="text-[10px] font-mono-tech text-gray-400 bg-[#1a1a1a] px-2 py-0.5 rounded-md border border-[#252525]">
                        {product.category || 'Urbana'}
                      </span>
                    </div>

                    {/* Image and basic info */}
                    <div className="flex gap-4 items-start mb-4">
                      <div className="w-24 h-24 rounded-xl bg-[#0a0a0a] border border-[#252525] overflow-hidden shrink-0 flex items-center justify-center relative">
                        <img
                          src={mainImg}
                          alt={product.name}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/scooter_stake_red.jpg';
                          }}
                        />
                        {product.isFeatured && (
                          <span className="absolute bottom-1 left-1 bg-[#39FF14] text-black text-[8px] font-black uppercase px-1 rounded">
                            Destaque
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider block truncate">
                          {product.brand || 'Vai de Elétrica'}
                        </span>
                        <h3 className="text-sm font-bold text-white truncate font-heading">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {product.model}
                        </p>

                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-sm font-extrabold text-[#39FF14] font-mono-tech">
                            R$ {product.promoPrice ? product.promoPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          {product.promoPrice && product.promoPrice < product.price && (
                            <span className="text-[10px] text-gray-500 line-through font-mono-tech">
                              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-3">
                          <span>{product.powerWatts || 1000}W</span>
                          <span>•</span>
                          <span>{product.stockQuantity || 0} em estoque</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-[#1e1e1e] flex items-center justify-between gap-2">
                      {/* Toggle publish / hide */}
                      <button
                        onClick={() => handleTogglePublish(product)}
                        className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isPublished
                            ? 'bg-[#181818] hover:bg-[#222] text-gray-300 border border-[#2a2a2a]'
                            : 'bg-green-950/60 hover:bg-green-900/80 text-[#39FF14] border border-[#39FF14]/40'
                        }`}
                        title={isPublished ? 'Ocultar da loja' : 'Publicar na loja'}
                      >
                        {isPublished ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Publicar</span>
                          </>
                        )}
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="py-1.5 px-3 rounded-lg bg-[#181818] hover:bg-[#252525] border border-[#2a2a2a] text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Editar modelo"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                        <span>Editar</span>
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => setProductToDelete(product)}
                        className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 border border-red-900/30 text-red-400 text-xs transition cursor-pointer"
                        title="Excluir modelo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isFormOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#39FF14]/40 w-full max-w-3xl rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] my-8 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#181818] px-6 py-4 border-b border-[#242424] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  {editingProduct.id ? 'Editar Scooter Elétrica' : 'Cadastrar Nova Scooter Elétrica'}
                </h3>
                <p className="text-xs text-gray-400">
                  Preencha as informações do modelo. As alterações refletem automaticamente no site público.
                </p>
              </div>

              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* 1. SEÇÃO DE IDENTIFICAÇÃO BÁSICA */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#39FF14] uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  <span>1. Identificação do Modelo</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Nome Comercial do Modelo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Vai de Elétrica Stake 1000"
                      value={editingProduct.name || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Versão / Modelo Completo
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Stake 1000W City Edition"
                      value={editingProduct.model || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Marca / Fabricante
                    </label>
                    <input
                      type="text"
                      placeholder="Vai de Elétrica"
                      value={editingProduct.brand || 'Vai de Elétrica'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Categoria / Tipo
                    </label>
                    <select
                      value={editingProduct.category || 'Urbana'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-sm text-white outline-none cursor-pointer"
                    >
                      <option value="Urbana">Urbana</option>
                      <option value="Performance">Performance</option>
                      <option value="Sport">Sport</option>
                      <option value="Carga">Carga</option>
                      <option value="Utilitária">Utilitária</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. VALORES E ESTOQUE */}
              <div className="space-y-4 pt-4 border-t border-[#222]">
                <h4 className="text-xs font-bold text-[#39FF14] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>2. Valores e Estoque</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Preço de Venda (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Ex: 4998.90"
                      value={editingProduct.price || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-sm text-white font-mono-tech outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Preço Promocional (R$) (Opcional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 4499.00"
                      value={editingProduct.promoPrice ?? ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          promoPrice: e.target.value ? parseFloat(e.target.value) : null,
                          isOffer: Boolean(e.target.value)
                        })
                      }
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-sm text-white font-mono-tech outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Estoque Disponível (Unidades)
                    </label>
                    <input
                      type="number"
                      required
                      value={editingProduct.stockQuantity ?? 10}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stockQuantity: parseInt(e.target.value, 10) || 0,
                          inStock: (parseInt(e.target.value, 10) || 0) > 0
                        })
                      }
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-sm text-white font-mono-tech outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. FOTOGRAFIA COM UPLOAD REAL */}
              <div className="space-y-4 pt-4 border-t border-[#222]">
                <h4 className="text-xs font-bold text-[#39FF14] uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  <span>3. Imagens do Produto (Upload Real do Celular ou PC)</span>
                </h4>

                <div className="bg-[#181818] p-4 rounded-2xl border border-[#2a2a2a] space-y-4">
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    {/* Image Preview Box */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-32 h-32 rounded-2xl bg-[#0a0a0a] border-2 border-dashed border-[#39FF14]/50 overflow-hidden shrink-0 flex items-center justify-center relative group cursor-pointer hover:border-[#39FF14] transition shadow-inner"
                      title="Clique para selecionar ou trocar a foto"
                    >
                      {editingProduct.images?.[0] ? (
                        <img
                          src={editingProduct.images[0]}
                          alt="Prévia do modelo"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="text-center p-2">
                          <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-1" />
                          <span className="text-[10px] text-gray-400 block font-semibold">Sem foto</span>
                        </div>
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-1">
                          <div className="w-6 h-6 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin" />
                          <span className="text-[9px] text-[#39FF14] font-bold">Enviando...</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider">
                        Trocar Foto
                      </div>
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Hidden Native File Input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.heic,.heif"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={isUploading}
                        />

                        {/* Explicit Button that triggers file input */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-4 py-2.5 bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2 transition shadow-[0_0_15px_rgba(57,255,20,0.25)] active:scale-95"
                        >
                          <Upload className="w-4 h-4 stroke-[2.5]" />
                          <span>Selecionar Foto do Aparelho / PC</span>
                        </button>

                        {editingProduct.images?.[0] && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct({ ...editingProduct, images: [] });
                              addToast('info', 'Foto removida do formulário.');
                            }}
                            className="px-3 py-2 bg-[#222] hover:bg-red-950/60 text-gray-400 hover:text-red-400 border border-[#333] hover:border-red-800/40 rounded-xl text-xs font-semibold transition cursor-pointer"
                          >
                            Remover
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-400">
                        {uploadProgress || 'Toque no botão para enviar uma foto direto da sua câmera, galeria do celular ou computador. Formatos aceitos: JPG, PNG, WEBP, HEIC.'}
                      </p>

                      {/* Quick Presets from Catalog */}
                      <div className="pt-1">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-1.5">
                          Ou selecione uma foto oficial da Vai de Elétrica:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: 'Stake 1000 Vermelha', url: '/images/scooter_stake_red.jpg' },
                            { label: 'Savage 1000 Verde', url: '/images/scooter_savage_green.jpg' },
                            { label: 'Dot 1000 Preta', url: '/images/scooter_dot_black.jpg' },
                            { label: 'E-BM3 Utilitária', url: '/images/scooter_ebm3_red.jpg' },
                            { label: 'E-Cross 4 Rodas', url: '/images/scooter_ecross_grey.jpg' },
                          ].map((preset) => (
                            <button
                              key={preset.url}
                              type="button"
                              onClick={() => {
                                const current = editingProduct.images ? [...editingProduct.images] : [];
                                current[0] = preset.url;
                                setEditingProduct({ ...editingProduct, images: current });
                                addToast('success', `Foto "${preset.label}" selecionada!`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#141414] hover:bg-[#202020] border border-[#2a2a2a] hover:border-[#39FF14]/50 text-[10px] text-gray-300 hover:text-[#39FF14] transition cursor-pointer font-medium"
                            >
                              + {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1">
                        <label className="block text-[10px] text-gray-400 uppercase font-semibold mb-1">
                          Ou cole a URL direta de uma imagem:
                        </label>
                        <input
                          type="text"
                          placeholder="/images/scooter_stake_red.jpg ou https://..."
                          value={editingProduct.images?.[0] || ''}
                          onChange={(e) => {
                            const imgs = editingProduct.images ? [...editingProduct.images] : [];
                            imgs[0] = e.target.value;
                            setEditingProduct({ ...editingProduct, images: imgs });
                          }}
                          className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-1.5 text-xs text-white font-mono-tech outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. ESPECIFICAÇÕES TÉCNICAS (OPCIONAIS) */}
              <div className="space-y-4 pt-4 border-t border-[#222]">
                <h4 className="text-xs font-bold text-[#39FF14] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>4. Especificações Técnicas (Opcionais)</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Potência do Motor (W)
                    </label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={editingProduct.powerWatts || ''}
                      onChange={(e) => {
                        const w = parseInt(e.target.value, 10) || 1000;
                        setEditingProduct({
                          ...editingProduct,
                          powerWatts: w,
                          power: `${w}W Brushless High Efficiency`
                        });
                      }}
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-xs text-white font-mono-tech outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Autonomia (km)
                    </label>
                    <input
                      type="number"
                      placeholder="60"
                      value={editingProduct.autonomyKm || ''}
                      onChange={(e) => {
                        const km = parseInt(e.target.value, 10) || 50;
                        setEditingProduct({
                          ...editingProduct,
                          autonomyKm: km,
                          autonomy: `Até ${km} km`
                        });
                      }}
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-xs text-white font-mono-tech outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Velocidade Máxima
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 45 km/h"
                      value={editingProduct.maxSpeed || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, maxSpeed: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Tempo de Recarga
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 4 a 6 horas"
                      value={editingProduct.chargingTime || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, chargingTime: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Capacidade da Bateria
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 60V 20Ah Lítio Removível"
                      value={editingProduct.battery || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, battery: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Sistema de Freios
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Disco Dianteiro e Traseiro"
                      value={editingProduct.brakes || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, brakes: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Capacidade de Carga (kg)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 160 kg"
                      value={editingProduct.maxWeight || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, maxWeight: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                      Selo / Destaque (Badge)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Mais Vendida, Lançamento"
                      value={editingProduct.badge || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 5. DESCRIÇÃO DETALHADA */}
              <div className="space-y-4 pt-4 border-t border-[#222]">
                <h4 className="text-xs font-bold text-[#39FF14] uppercase tracking-wider">
                  5. Descrição e Informações Comerciais
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Descrição Completa do Modelo
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descreva os diferenciais, estilo de condução e facilidades da scooter..."
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
              </div>

              {/* 6. STATUS E PUBLICAÇÃO */}
              <div className="space-y-3 pt-4 border-t border-[#222] bg-[#161616] p-4 rounded-2xl border border-[#262626]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  6. Visibilidade e Publicação no Site
                </h4>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.isPublished !== false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isPublished: e.target.checked })}
                      className="w-4 h-4 accent-[#39FF14] rounded"
                    />
                    <span className="text-xs font-semibold text-gray-200">
                      Publicar modelo imediatamente na loja pública
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProduct.isFeatured)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                      className="w-4 h-4 accent-[#39FF14] rounded"
                    />
                    <span className="text-xs font-semibold text-gray-200">
                      Destacar na página inicial
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-[#242424] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#202020] hover:bg-[#282828] text-gray-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Salvar Scooter</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-red-500/40 w-full max-w-md rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-500/40 flex items-center justify-center mx-auto mb-4 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center font-heading">
              Confirmar Exclusão
            </h3>
            <p className="text-xs text-gray-400 text-center mt-2 leading-relaxed">
              Você tem certeza que deseja excluir permanentemente o modelo{' '}
              <strong className="text-white font-bold">{productToDelete.name}</strong>?
            </p>
            <p className="text-[11px] text-red-400/90 text-center mt-1">
              Esta ação removerá o produto do banco de dados e do catálogo da loja.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-[#222] hover:bg-[#2a2a2a] text-gray-300 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sim, Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ORDER DETAILS */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#2a2a2a] w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] my-8 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#181818] px-6 py-4 border-b border-[#242424] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#222] border border-[#333] flex items-center justify-center text-[#39FF14]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                    <span>Pedido {selectedOrderDetails.id}</span>
                    <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-[#252525] text-gray-300">
                      {new Date(selectedOrderDetails.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Detalhes completos do cliente, entrega, pagamento e produtos.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Status & Quick Action */}
              <div className="bg-[#161616] p-4 rounded-2xl border border-[#242424] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-semibold text-xs">Status Atual:</span>
                  <select
                    value={selectedOrderDetails.status}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrderDetails.id, e.target.value as any)}
                    className="bg-[#202020] border border-[#333] text-[#39FF14] font-bold text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Em Separação">Em Separação</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                {selectedOrderDetails.status === 'Pendente' && (
                  <button
                    type="button"
                    disabled={isUpdatingOrder}
                    onClick={() =>
                      handleUpdateOrderStatus(
                        selectedOrderDetails.id,
                        'Aprovado',
                        'Pagamento confirmado e validado pelo administrador.'
                      )
                    }
                    className="py-2 px-3.5 bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(57,255,20,0.3)] cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4 stroke-[2.8]" />
                    <span>Aprovar Pagamento</span>
                  </button>
                )}
              </div>

              {/* Customer & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#161616] p-4 rounded-2xl border border-[#242424] space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                    Dados do Comprador
                  </span>
                  <div className="text-white font-bold text-sm">
                    {selectedOrderDetails.customer.name}
                  </div>
                  <div className="text-gray-400 font-mono-tech">
                    CPF: {formatCPF(selectedOrderDetails.customer.cpf)}
                  </div>
                  <div className="text-gray-400">
                    E-mail: {selectedOrderDetails.customer.email || 'Não informado'}
                  </div>
                  <div className="pt-1">
                    <a
                      href={`https://wa.me/${(selectedOrderDetails.customer.whatsapp || selectedOrderDetails.customer.phone || '').replace(/\D/g, '').startsWith('55') ? (selectedOrderDetails.customer.whatsapp || selectedOrderDetails.customer.phone || '').replace(/\D/g, '') : `55${(selectedOrderDetails.customer.whatsapp || selectedOrderDetails.customer.phone || '').replace(/\D/g, '')}`}?text=${encodeURIComponent(
                        `Olá ${selectedOrderDetails.customer.name.split(' ')[0]}! Aqui é da equipe Vai de Elétrica sobre o seu pedido ${selectedOrderDetails.id}.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#39FF14] hover:underline font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp: {formatPhone(selectedOrderDetails.customer.whatsapp || selectedOrderDetails.customer.phone || '')}</span>
                    </a>
                  </div>
                </div>

                <div className="bg-[#161616] p-4 rounded-2xl border border-[#242424] space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                    Endereço de Entrega
                  </span>
                  <div className="text-gray-200">
                    {selectedOrderDetails.customer.street}, {selectedOrderDetails.customer.number}
                    {selectedOrderDetails.customer.complement ? ` (${selectedOrderDetails.customer.complement})` : ''}
                  </div>
                  <div className="text-gray-400">
                    Bairro: {selectedOrderDetails.customer.neighborhood || '-'}
                  </div>
                  <div className="text-gray-400">
                    Cidade: {selectedOrderDetails.customer.city} / {selectedOrderDetails.customer.state}
                  </div>
                  <div className="text-gray-400 font-mono-tech">
                    CEP: {selectedOrderDetails.customer.cep}
                  </div>
                </div>
              </div>

              {/* Items Purchased */}
              <div className="bg-[#161616] p-4 rounded-2xl border border-[#242424] space-y-3">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">
                  Itens Comprados
                </span>
                <div className="space-y-2.5">
                  {selectedOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#121212] border border-[#202020]">
                      <div className="flex items-center gap-3">
                        {item.scooter.images?.[0] ? (
                          <img
                            src={item.scooter.images[0]}
                            alt={item.scooter.name}
                            className="w-12 h-12 rounded-lg object-contain bg-black/40 border border-[#333] shrink-0 p-1"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#222] flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="text-white font-bold text-xs">{item.scooter.name}</div>
                          <div className="text-[11px] text-gray-400">
                            {item.quantity}x • {formatBRL(item.scooter.promoPrice ?? item.scooter.price)} cada
                            {item.selectedColor ? ` • Cor: ${item.selectedColor}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono-tech font-bold text-white text-xs">
                        {formatBRL((item.scooter.promoPrice ?? item.scooter.price) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-[#161616] p-4 rounded-2xl border border-[#242424] space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal dos Produtos:</span>
                  <span className="font-mono-tech text-gray-200">{formatBRL(selectedOrderDetails.subtotal)}</span>
                </div>
                {selectedOrderDetails.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto PIX à Vista (5% OFF):</span>
                    <span className="font-mono-tech">-{formatBRL(selectedOrderDetails.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Frete Especial com Seguro:</span>
                  <span className="text-emerald-400 font-semibold">Grátis</span>
                </div>
                <div className="border-t border-[#262626] pt-2 flex justify-between items-baseline text-sm">
                  <span className="text-white font-bold">Valor Total Final:</span>
                  <span className="text-xl font-black text-[#39FF14] font-mono-tech">
                    {formatBRL(selectedOrderDetails.total)}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 pt-1">
                  Forma de pagamento:{' '}
                  <strong className="text-white uppercase font-bold">
                    {selectedOrderDetails.paymentMethod === 'pix'
                      ? 'PIX (5% OFF à vista)'
                      : selectedOrderDetails.paymentMethod === 'credit_card'
                      ? `Cartão de Crédito ${selectedOrderDetails.installments ? `(${selectedOrderDetails.installments}x)` : ''}`
                      : 'Boleto Bancário'}
                  </strong>
                </div>

                {/* PIX Exact Amount Verification Box */}
                {selectedOrderDetails.paymentMethod === 'pix' && (
                  <div className="mt-3 pt-3 border-t border-[#262626] bg-[#111111] p-3.5 rounded-xl border border-[#39FF14]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-[#39FF14]" />
                        PIX com Valor Exato do Pedido ({formatBRL(selectedOrderDetails.total)})
                      </span>
                      <span className="text-[10px] text-[#39FF14] font-bold bg-[#39FF14]/15 px-2 py-0.5 rounded-md border border-[#39FF14]/30">
                        Padrão BCB Ativo
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="w-24 h-24 bg-white p-1 rounded-xl shrink-0 border-2 border-[#39FF14]/40 flex items-center justify-center shadow-sm">
                        <img
                          src={getPixQrCodeUrl(selectedOrderDetails.pixCode || generatePixCode(selectedOrderDetails.id, selectedOrderDetails.total, settings.pixKey))}
                          alt="QR Code PIX do Pedido"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 space-y-2 text-left w-full">
                        <div className="text-[11px] text-gray-300">
                          Chave da Loja: <strong className="text-[#39FF14] font-mono">{settings.pixKey || '8f0cc2dd-dac2-47e4-a824-09be9f10cd21'}</strong>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Ao ser lido pelo banco do cliente, o valor exato de <strong>{formatBRL(selectedOrderDetails.total)}</strong> já é preenchido automaticamente.
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const code = selectedOrderDetails.pixCode || generatePixCode(selectedOrderDetails.id, selectedOrderDetails.total, settings.pixKey);
                            navigator.clipboard.writeText(code);
                            addToast('success', 'Código Pix Copia e Cola com valor exato copiado!');
                          }}
                          className="px-3 py-1.5 bg-[#1f1f1f] hover:bg-[#282828] text-white border border-[#39FF14]/50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#39FF14]" />
                          <span>Copiar Pix Copia e Cola ({formatBRL(selectedOrderDetails.total)})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-[#181818] px-6 py-4 border-t border-[#242424] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setOrderToDelete(selectedOrderDetails);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 hover:text-red-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Apagar este pedido permanentemente"
              >
                <Trash2 className="w-4 h-4" />
                <span>Apagar Pedido</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-5 py-2.5 rounded-xl bg-[#202020] hover:bg-[#282828] text-gray-300 text-xs font-bold transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE SINGLE ORDER CONFIRMATION */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-red-500/40 w-full max-w-md rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-500/40 flex items-center justify-center mx-auto mb-4 text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center font-heading">
              Apagar Pedido {orderToDelete.id}
            </h3>
            <div className="bg-[#1a1a1a] p-3.5 rounded-2xl border border-[#2a2a2a] my-4 text-xs space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Cliente:</span>
                <span className="text-white font-bold truncate max-w-[200px]">{orderToDelete.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Valor Total:</span>
                <span className="text-[#39FF14] font-mono-tech font-bold">{formatBRL(orderToDelete.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-gray-200 uppercase font-semibold">{orderToDelete.status}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Você tem certeza que deseja apagar permanentemente este pedido do sistema?
            </p>
            <p className="text-[11px] text-red-400/90 text-center mt-1">
              Esta ação removerá o pedido do banco de dados e recalculará as métricas de faturamento.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-[#222] hover:bg-[#2a2a2a] text-gray-300 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={handleConfirmDeleteOrder}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingOrder ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sim, Apagar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CLEAR ALL ORDERS CONFIRMATION */}
      {isClearOrdersModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-red-500/40 w-full max-w-md rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-500/40 flex items-center justify-center mx-auto mb-4 text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center font-heading">
              Apagar Todos os Pedidos
            </h3>
            <p className="text-xs text-gray-400 text-center mt-2 leading-relaxed">
              Você tem certeza que deseja apagar todos os <strong className="text-white font-bold">{orders.length} pedidos</strong> do histórico de vendas?
            </p>
            <p className="text-[11px] text-red-400/90 text-center mt-2">
              Atenção: Esta ação apagará permanentemente todos os registros de pedidos e resetará as métricas financeiras.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsClearOrdersModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#222] hover:bg-[#2a2a2a] text-gray-300 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={handleConfirmClearAllOrders}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingOrder ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sim, Limpar Tudo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PIX CONFIGURATION */}
      {isPixModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121212] border border-[#39FF14]/50 w-full max-w-xl rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] my-8 animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#181818] px-6 py-4 border-b border-[#242424] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#182618] border border-[#39FF14]/40 flex items-center justify-center text-[#39FF14]">
                  <QrCode className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    Configurar Pagamento PIX
                  </h3>
                  <p className="text-xs text-gray-400">
                    Atualize o QR Code e a chave Pix exibidos no checkout dos clientes.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPixModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePixSettings} className="p-6 space-y-6">
              {/* Dynamic PIX with Exact Amount Notice */}
              <div className="bg-[#182618] border border-[#39FF14]/50 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-pulse"></span>
                  <span className="text-xs font-black text-[#39FF14] uppercase tracking-wider">
                    Geração Dinâmica de Pix Ativada (Padrão Banco Central)
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Para que o cliente pague com total praticidade, o sistema gera o <strong>QR Code e o Copia e Cola dinamicamente para cada modelo</strong> com o <strong>valor exato</strong> embutido. Ao ler o código no aplicativo do banco, o comprador não precisa digitar o valor — ele já vem preenchido na tela pronto para pagar!
                </p>
              </div>

              {/* Live Simulator for Admin */}
              <div className="bg-[#141414] border border-[#2a2a2a] p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#39FF14]" />
                    Simulador do QR Code com Valor Exato
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Teste no seu celular agora
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0d0d0d] p-3 rounded-xl border border-[#222222]">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl shrink-0 border-2 border-[#39FF14]/50 flex items-center justify-center shadow-md">
                    {simulatedQrUrl ? (
                      <img
                        src={simulatedQrUrl}
                        alt="QR Code Dinâmico Simulado"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode className="w-12 h-12 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-left w-full">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">
                        Valor simulado para teste (R$):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={simulatedPixAmount}
                        onChange={(e) => setSimulatedPixAmount(Number(e.target.value) || 0)}
                        className="w-full bg-[#181818] border border-[#333333] focus:border-[#39FF14] rounded-lg px-3 py-1.5 text-xs text-white font-mono-tech outline-none"
                      />
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold">
                      ✓ Aponte a câmera do seu banco para o QR ao lado: o valor de <strong>{formatBRL(simulatedPixAmount)}</strong> aparecerá na tela do seu banco!
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const code = generatePixCode(
                          'TESTE',
                          simulatedPixAmount,
                          pixKeyInput || '8f0cc2dd-dac2-47e4-a824-09be9f10cd21',
                          settings.tradeName || 'VAI DE ELETRICA',
                          'SAO PAULO'
                        );
                        navigator.clipboard.writeText(code);
                        addToast('success', 'Código Pix simulado copiado!');
                      }}
                      className="px-3 py-1.5 bg-[#202020] hover:bg-[#2a2a2a] text-white border border-[#39FF14]/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#39FF14]" />
                      <span>Copiar Pix Copia e Cola ({formatBRL(simulatedPixAmount)})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* QR Code Upload Section */}
              <div className="bg-[#161616] p-4 rounded-2xl border border-[#262626] space-y-4">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Imagem do QR Code Pix
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-36 h-36 rounded-2xl bg-white p-2 border-2 border-dashed border-[#39FF14]/60 shrink-0 flex items-center justify-center overflow-hidden shadow-md">
                    {pixQrUrlInput ? (
                      <img
                        src={pixQrUrlInput}
                        alt="QR Code PIX Atual"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <QrCode className="w-10 h-10 text-gray-400 mx-auto mb-1" />
                        <span className="text-[10px] font-bold text-gray-600 block">QR Dinâmico Padrão</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-left">
                    <input
                      ref={pixFileInputRef}
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.heic,.heif"
                      onChange={handlePixFileUpload}
                      className="hidden"
                      disabled={isUploadingPix}
                    />

                    <button
                      type="button"
                      onClick={() => pixFileInputRef.current?.click()}
                      disabled={isUploadingPix}
                      className="px-4 py-2.5 bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-2 transition shadow-md"
                    >
                      <Upload className="w-4 h-4 stroke-[2.5]" />
                      <span>{isUploadingPix ? 'Enviando Foto...' : 'Selecionar Novo QR Code'}</span>
                    </button>

                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Envie a foto ou captura de tela do QR Code gerado no aplicativo do seu banco (Itaú, Nubank, Bradesco, Mercado Pago, etc.).
                    </p>

                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase font-semibold mb-1">
                        Ou cole o link direto da imagem:
                      </label>
                      <input
                        type="text"
                        placeholder="/images/pix_qrcode.png ou https://..."
                        value={pixQrUrlInput}
                        onChange={(e) => setPixQrUrlInput(e.target.value)}
                        className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-1.5 text-xs text-white font-mono-tech outline-none"
                      />
                    </div>

                    {pixQrUrlInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setPixQrUrlInput('');
                          addToast('info', 'QR Code personalizado removido. O sistema usará o QR Code padrão.');
                        }}
                        className="text-[11px] text-red-400 hover:underline cursor-pointer block"
                      >
                        Restaurar QR Code padrão
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Chave Pix e Copia e Cola */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Chave Pix da Loja (CNPJ, Celular, E-mail ou Chave Aleatória) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 5511972040833 ou pix@vaideeletrica.com.br"
                    value={pixKeyInput}
                    onChange={(e) => setPixKeyInput(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono-tech outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Código Pix Copia e Cola (Opcional - Código Alfanumérico)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Cole aqui o código Pix Copia e Cola completo (ex: 00020126580014br.gov.bcb.pix...)"
                    value={pixCopiaEColaInput}
                    onChange={(e) => setPixCopiaEColaInput(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono-tech outline-none resize-none"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Se preenchido, o botão "Copiar Código PIX" do checkout copiará exatamente este código para facilitar o pagamento no celular do cliente.
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#242424] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPixModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#202020] hover:bg-[#282828] text-gray-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSavingPix}
                  className="px-6 py-2.5 bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {isSavingPix ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Salvar Configurações PIX</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl border text-xs shadow-xl flex items-center gap-2.5 pointer-events-auto animate-in slide-in-from-bottom-2 ${
              t.type === 'success'
                ? 'bg-[#152415] border-[#39FF14]/50 text-[#39FF14]'
                : t.type === 'error'
                ? 'bg-[#2a1515] border-red-500/50 text-red-400'
                : 'bg-[#181818] border-gray-700 text-gray-200'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-[#39FF14]" />}
            {t.type === 'error' && <XCircle className="w-4 h-4 shrink-0 text-red-400" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
