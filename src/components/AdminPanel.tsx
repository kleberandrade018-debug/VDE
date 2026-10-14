import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Scooter, Order, StoreSettings } from '../types';
import { formatBRL, formatCPF, formatPhone } from '../utils/formatters';
import { 
  X, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Edit3, 
  Package, 
  ShoppingBag, 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  MessageSquare, 
  Check, 
  Sparkles,
  Link,
  DollarSign
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    resetDefaultCatalog,
    orders,
    updateOrderStatus,
    settings,
    updateSettings
  } = useStore();

  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');

  // Product Editing / Creation State
  const [editingScooter, setEditingScooter] = useState<Scooter | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Settings local edit state
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  if (!isAdminOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default password or custom: 'admin123' or 'vaideeletrica'
    if (adminPassword === 'admin123' || adminPassword === 'vaideeletrica' || adminPassword === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Senha incorreta. Dica: use "admin123" para gerenciar.');
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScooter) return;

    if (isCreatingNew) {
      addProduct(editingScooter);
    } else {
      updateProduct(editingScooter);
    }

    setEditingScooter(null);
    setIsCreatingNew(false);
  };

  const handleCreateNewProduct = () => {
    const newId = `vde-${Date.now().toString().slice(-4)}`;
    setEditingScooter({
      id: newId,
      name: 'Nova Scooter Vai de Elétrica',
      model: 'VDE 2000W Model',
      slug: `scooter-${newId}`,
      price: 5990.00,
      promoPrice: null,
      power: '2000W Brushless',
      powerWatts: 2000,
      battery: '60V 20Ah Lítio Removível',
      autonomy: '60 km',
      autonomyKm: 60,
      maxSpeed: '50 km/h',
      chargingTime: '4 a 6 horas',
      maxWeight: '160 kg',
      brakes: 'Disco Dianteiro e Traseiro',
      inStock: true,
      stockQuantity: 10,
      isFeatured: false,
      isOffer: false,
      badge: 'Novidade',
      category: 'Urbana',
      images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1000&auto=format&fit=crop'],
      description: 'Descrição completa do novo modelo de scooter elétrica.',
      features: ['Motor elétrico silencioso de alto torque', 'Bateria de lítio removível', 'Painel digital LED'],
      warranty: '12 meses para motor e chassi; 6 meses para bateria'
    });
    setIsCreatingNew(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      <div className="bg-[#121212] border border-[#2a2a2a] w-full max-w-5xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden relative my-6">
        
        {/* Header */}
        <div className="p-6 bg-[#0a0a0a] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#181818] border border-[#39FF14]/40 flex items-center justify-center text-[#39FF14]">
              {isAuthenticated ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-heading">
                Painel Administrativo • Vai de Elétrica
              </h2>
              <span className="text-xs text-gray-400">
                Gerenciamento de Produtos, Pedidos, Configurações e Link do APK
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAdminOpen(false)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1a1a1a] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOGIN SCREEN */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#181818] border border-[#39FF14]/40 flex items-center justify-center mx-auto text-[#39FF14]">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-heading">Acesso do Proprietário</h3>
              <p className="text-xs text-gray-400 mt-1">
                Insira a senha mestra para gerenciar a loja Vai de Elétrica.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Senha de acesso (padrão: admin123)"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] text-white rounded-xl px-4 py-3 text-center text-sm focus:outline-none"
                autoFocus
              />

              {authError && (
                <p className="text-xs text-red-400">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#39FF14] hover:bg-[#32e012] text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(57,255,20,0.4)]"
              >
                Entrar no Painel
              </button>

              <div className="pt-2 text-[11px] text-gray-500">
                Acesso seguro e restrito à equipe Vai de Elétrica.
              </div>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex flex-col max-h-[82vh]">
            
            {/* Admin Tabs */}
            <div className="flex border-b border-[#222222] bg-[#0d0d0d] px-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition ${
                  activeTab === 'products'
                    ? 'border-[#39FF14] text-[#39FF14]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Scooters ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition ${
                  activeTab === 'orders'
                    ? 'border-[#39FF14] text-[#39FF14]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Pedidos ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 cursor-pointer transition ${
                  activeTab === 'settings'
                    ? 'border-[#39FF14] text-[#39FF14]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Configurações & Link do APK</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* TAB 1: PRODUCTS MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  
                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#222222]">
                    <div>
                      <h3 className="text-base font-bold text-white font-heading">
                        Catálogo de Scooters Elétricas
                      </h3>
                      <p className="text-xs text-gray-400">
                        Adicione novos modelos, ajuste preços, gerencie ofertas e estoque.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={resetDefaultCatalog}
                        className="px-3 py-2 bg-[#181818] hover:bg-[#222222] text-gray-300 text-xs font-semibold rounded-xl border border-gray-700 flex items-center gap-1.5 transition cursor-pointer"
                        title="Restaurar catálogo original de fábrica"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurar Padrão</span>
                      </button>

                      <button
                        onClick={handleCreateNewProduct}
                        className="px-4 py-2 bg-[#39FF14] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(57,255,20,0.3)] cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Nova Scooter</span>
                      </button>
                    </div>
                  </div>

                  {/* Edit / Create Form Modal inline */}
                  {editingScooter && (
                    <form onSubmit={handleSaveProduct} className="bg-[#181818] p-6 rounded-2xl border border-[#39FF14]/50 space-y-4 mb-6 animate-in fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider text-[#39FF14]">
                          {isCreatingNew ? 'Cadastrar Nova Scooter Elétrica' : `Editar Scooter: ${editingScooter.name}`}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingScooter(null)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block text-gray-300 mb-1">Nome Comercial</label>
                          <input
                            type="text"
                            required
                            value={editingScooter.name}
                            onChange={(e) => setEditingScooter({ ...editingScooter, name: e.target.value })}
                            className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 mb-1">Modelo / Versão</label>
                          <input
                            type="text"
                            required
                            value={editingScooter.model}
                            onChange={(e) => setEditingScooter({ ...editingScooter, model: e.target.value })}
                            className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 mb-1">Categoria</label>
                          <select
                            value={editingScooter.category}
                            onChange={(e) => setEditingScooter({ ...editingScooter, category: e.target.value as any })}
                            className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] text-white rounded-xl px-3 py-2"
                          >
                            <option value="Urbana">Urbana</option>
                            <option value="Performance">Performance</option>
                            <option value="Sport">Sport</option>
                            <option value="Carga">Carga</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-300 mb-1">Preço Oficial (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={editingScooter.price}
                            onChange={(e) => setEditingScooter({ ...editingScooter, price: Number(e.target.value) })}
                            className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white font-mono-tech"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 mb-1">Preço Promocional (R$ - opcional)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingScooter.promoPrice ?? ''}
                            onChange={(e) => setEditingScooter({ ...editingScooter, promoPrice: e.target.value ? Number(e.target.value) : null })}
                            placeholder="Deixe vazio se não houver promoção"
                            className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white font-mono-tech"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 mb-1">Estoque Disponível</label>
                          <input
                            type="number"
                            required
                            value={editingScooter.stockQuantity}
                            onChange={(e) => setEditingScooter({ ...editingScooter, stockQuantity: Number(e.target.value), inStock: Number(e.target.value) > 0 })}
                            className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white font-mono-tech"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 mb-1">Potência (Watts)</label>
                          <input
                            type="number"
                            required
                            value={editingScooter.powerWatts}
                            onChange={(e) => setEditingScooter({ ...editingScooter, powerWatts: Number(e.target.value), power: `${e.target.value}W Brushless` })}
                            className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white font-mono-tech"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 mb-1">Autonomia (Km)</label>
                          <input
                            type="number"
                            required
                            value={editingScooter.autonomyKm}
                            onChange={(e) => setEditingScooter({ ...editingScooter, autonomyKm: Number(e.target.value), autonomy: `Até ${e.target.value} km` })}
                            className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white font-mono-tech"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 mb-1">Selo / Badge (ex: Mais Vendida)</label>
                          <input
                            type="text"
                            value={editingScooter.badge || ''}
                            onChange={(e) => setEditingScooter({ ...editingScooter, badge: e.target.value })}
                            className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white"
                          />
                        </div>

                        <div className="sm:col-span-3 space-y-2">
                          <label className="block text-gray-300 font-semibold mb-1">Fotografia Principal do Produto</label>
                          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <input
                              type="text"
                              required
                              placeholder="URL da imagem (ex: /images/scooter_savage_green.jpg ou https://...)"
                              value={editingScooter.images[0] || ''}
                              onChange={(e) => {
                                const imgs = [...editingScooter.images];
                                imgs[0] = e.target.value;
                                setEditingScooter({ ...editingScooter, images: imgs });
                              }}
                              className="flex-1 w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white text-xs"
                            />
                            <label className="px-4 py-2 bg-[#222222] hover:bg-[#2e2e2e] text-[#39FF14] text-xs font-bold rounded-xl border border-[#39FF14]/40 cursor-pointer flex items-center gap-1.5 transition whitespace-nowrap">
                              <span>📁 Enviar Foto do Aparelho</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const base64 = event.target?.result as string;
                                      if (base64) {
                                        const imgs = [...editingScooter.images];
                                        imgs[0] = base64;
                                        setEditingScooter({ ...editingScooter, images: imgs });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          {editingScooter.images[0] && (
                            <div className="flex items-center gap-2 pt-1">
                              <img src={editingScooter.images[0]} alt="Prévia" className="w-12 h-12 rounded-lg object-cover border border-[#333]" />
                              <span className="text-[10px] text-gray-400">Prévia da imagem carregada</span>
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-gray-300 mb-1">Descrição Detalhada</label>
                          <textarea
                            rows={3}
                            value={editingScooter.description}
                            onChange={(e) => setEditingScooter({ ...editingScooter, description: e.target.value })}
                            className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] rounded-xl px-3 py-2 text-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingScooter(null)}
                          className="px-4 py-2 bg-[#222222] text-gray-300 rounded-xl text-xs font-semibold"
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#39FF14] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.4)]"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Products Table */}
                  <div className="bg-[#181818] rounded-2xl border border-[#262626] overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#121212] text-gray-400 uppercase tracking-wider font-semibold border-b border-[#222222]">
                        <tr>
                          <th className="p-3">Veículo</th>
                          <th className="p-3">Preço Oficial</th>
                          <th className="p-3">Promoção</th>
                          <th className="p-3">Potência</th>
                          <th className="p-3">Autonomia</th>
                          <th className="p-3">Estoque</th>
                          <th className="p-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222]">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-[#1e1e1e] transition">
                            <td className="p-3 flex items-center gap-3">
                              <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-black" />
                              <div>
                                <span className="font-bold text-white block">{p.name}</span>
                                <span className="text-[10px] text-gray-400">{p.model}</span>
                              </div>
                            </td>
                            <td className="p-3 font-mono-tech">{formatBRL(p.price)}</td>
                            <td className="p-3">
                              {p.promoPrice ? (
                                <span className="text-[#39FF14] font-mono-tech font-bold">
                                  {formatBRL(p.promoPrice)}
                                </span>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                            <td className="p-3 font-mono-tech">{p.powerWatts}W</td>
                            <td className="p-3 font-mono-tech">{p.autonomyKm}km</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.inStock ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {p.stockQuantity} un.
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setEditingScooter(p);
                                  setIsCreatingNew(false);
                                }}
                                className="p-1.5 bg-[#262626] hover:bg-[#333333] text-gray-200 rounded-lg cursor-pointer"
                                title="Editar Produto"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg cursor-pointer"
                                title="Excluir Produto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* TAB 2: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[#222222]">
                    <div>
                      <h3 className="text-base font-bold text-white font-heading">
                        Pedidos Realizados pelos Clientes
                      </h3>
                      <p className="text-xs text-gray-400">
                        Acompanhe pagamentos, dados de entrega e atualize o status dos envios.
                      </p>
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-[#181818] p-12 text-center rounded-2xl border border-[#262626]">
                      <ShoppingBag className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-white">Nenhum pedido realizado ainda</h4>
                      <p className="text-xs text-gray-400">
                        Assim que um cliente concluir o checkout na loja, ele aparecerá aqui com todos os detalhes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-[#181818] border border-[#262626] rounded-2xl p-5 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242424] pb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-[#39FF14] font-mono-tech">{order.id}</span>
                              <span className="text-xs text-gray-400">• {new Date(order.createdAt).toLocaleString('pt-BR')}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Status:</span>
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                className="bg-[#121212] border border-[#333] text-xs text-white rounded-xl px-2.5 py-1 focus:border-[#39FF14] cursor-pointer"
                              >
                                <option value="Pendente">Pendente</option>
                                <option value="Aprovado">Aprovado</option>
                                <option value="Em Separação">Em Separação</option>
                                <option value="Enviado">Enviado</option>
                                <option value="Entregue">Entregue</option>
                                <option value="Cancelado">Cancelado</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-300">
                            <div>
                              <strong className="text-white block">Cliente:</strong>
                              <span>{order.customer.name}</span><br />
                              <span>WhatsApp: {order.customer.whatsapp}</span><br />
                              <span>CPF: {order.customer.cpf}</span>
                            </div>

                            <div>
                              <strong className="text-white block">Endereço de Entrega:</strong>
                              <span>{order.customer.street}, {order.customer.number}</span><br />
                              <span>{order.customer.city} - {order.customer.state}</span><br />
                              <span>CEP: {order.customer.cep}</span>
                            </div>

                            <div className="text-right sm:text-right">
                              <strong className="text-white block">Pagamento:</strong>
                              <span className="uppercase text-[#39FF14] font-bold">{order.paymentMethod}</span><br />
                              <span className="text-lg font-black text-white font-mono-tech">{formatBRL(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SETTINGS & APK URL */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  <div className="flex justify-between items-center pb-2 border-b border-[#222222]">
                    <div>
                      <h3 className="text-base font-bold text-white font-heading">
                        Configurações Oficiais da Loja
                      </h3>
                      <p className="text-xs text-gray-400">
                        Configure o link oficial do APK, WhatsApp de atendimento e dados corporativos.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#39FF14] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(57,255,20,0.4)] cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar Configurações</span>
                    </button>
                  </div>

                  {settingsSavedToast && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-500 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Configurações salvas e aplicadas em tempo real em todo o site!</span>
                    </div>
                  )}

                  {/* APK Configuration Box */}
                  <div className="bg-[#181818] p-5 rounded-2xl border border-[#39FF14]/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-[#39FF14]" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Endereço Oficial do Arquivo APK Android
                      </h4>
                    </div>

                    <p className="text-xs text-gray-400">
                      Insira a URL HTTPS direta para download do seu arquivo <code>.apk</code> oficial.
                      Se mantido vazio, o botão <strong>⬇ BAIXAR APK</strong> apresentará o modal oficial com a mensagem elegante requerida.
                    </p>

                    <input
                      type="url"
                      placeholder="https://seusite.com/downloads/vaideeletrica-v2.4.apk"
                      value={localSettings.officialApkUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, officialApkUrl: e.target.value })}
                      className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] text-white text-xs rounded-xl px-3.5 py-2.5 font-mono focus:outline-none"
                    />
                  </div>

                  {/* WhatsApp & PIX */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-[#181818] p-4 rounded-2xl border border-[#262626] space-y-2">
                      <label className="block text-gray-300 font-bold uppercase tracking-wider">
                        Número Oficial do WhatsApp (com DDI e DDD)
                      </label>
                      <input
                        type="text"
                        value={localSettings.officialWhatsApp}
                        onChange={(e) => setLocalSettings({ ...localSettings, officialWhatsApp: e.target.value })}
                        className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] text-white rounded-xl px-3 py-2 font-mono-tech focus:outline-none"
                      />
                      <span className="text-[10px] text-gray-500 block">Exemplo: 5511987654321</span>
                    </div>

                    <div className="bg-[#181818] p-4 rounded-2xl border border-[#262626] space-y-2">
                      <label className="block text-gray-300 font-bold uppercase tracking-wider">
                        Chave PIX da Loja
                      </label>
                      <input
                        type="text"
                        value={localSettings.pixKey}
                        onChange={(e) => setLocalSettings({ ...localSettings, pixKey: e.target.value })}
                        className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] text-white rounded-xl px-3 py-2 font-mono-tech focus:outline-none"
                      />
                      <span className="text-[10px] text-gray-500 block">E-mail, CNPJ ou chave aleatória</span>
                    </div>
                  </div>

                  {/* Announcement Banner */}
                  <div className="bg-[#181818] p-4 rounded-2xl border border-[#262626] space-y-2 text-xs">
                    <label className="block text-gray-300 font-bold uppercase tracking-wider">
                      Texto da Barra de Destaque Superior
                    </label>
                    <input
                      type="text"
                      value={localSettings.announcementBanner}
                      onChange={(e) => setLocalSettings({ ...localSettings, announcementBanner: e.target.value })}
                      className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-[#39FF14] text-white rounded-xl px-3 py-2 focus:outline-none"
                    />
                  </div>

                  {/* Institutional Data */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-gray-300 mb-1">Razão Social</label>
                      <input
                        type="text"
                        value={localSettings.businessName}
                        onChange={(e) => setLocalSettings({ ...localSettings, businessName: e.target.value })}
                        className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] text-white rounded-xl px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-1">CNPJ</label>
                      <input
                        type="text"
                        value={localSettings.cnpj}
                        onChange={(e) => setLocalSettings({ ...localSettings, cnpj: e.target.value })}
                        className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] text-white rounded-xl px-3 py-2 font-mono-tech"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-1">E-mail Institucional</label>
                      <input
                        type="email"
                        value={localSettings.email}
                        onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                        className="w-full bg-[#181818] border border-[#2e2e2e] focus:border-[#39FF14] text-white rounded-xl px-3 py-2"
                      />
                    </div>
                  </div>

                </form>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
