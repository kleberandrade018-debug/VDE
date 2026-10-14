import { Scooter, AdminUser, AdminStats, StoreSettings, Order } from '../types';

const TOKEN_KEY = 'vde_admin_token';

export const authStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (err) {
      console.error('Error saving admin token:', err);
    }
  },
  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.error('Error removing admin token:', err);
    }
  }
};

function getAuthHeaders(): HeadersInit {
  const token = authStorage.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // --- Public & Admin Products ---
  async getProducts(): Promise<Scooter[]> {
    const res = await fetch('/api/products');
    if (!res.ok) {
      throw new Error(`Falha ao buscar produtos: ${res.statusText}`);
    }
    return res.json();
  },

  async getAllAdminProducts(): Promise<Scooter[]> {
    const res = await fetch('/api/products', {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error(`Falha ao carregar catálogo administrativo: ${res.statusText}`);
    }
    return res.json();
  },

  async getProduct(id: string): Promise<Scooter> {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) {
      throw new Error(`Produto não encontrado: ${res.statusText}`);
    }
    return res.json();
  },

  async createProduct(data: Partial<Scooter>): Promise<{ message: string; product: Scooter }> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erro ao cadastrar produto.');
    }
    window.dispatchEvent(new CustomEvent('vde:products-updated'));
    return result;
  },

  async updateProduct(id: string, data: Partial<Scooter>): Promise<{ message: string; product: Scooter }> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erro ao atualizar produto.');
    }
    window.dispatchEvent(new CustomEvent('vde:products-updated'));
    return result;
  },

  async toggleProductStatus(id: string, isPublished: boolean): Promise<{ message: string; product: Scooter }> {
    const res = await fetch(`/api/products/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isPublished })
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erro ao alterar status do produto.');
    }
    window.dispatchEvent(new CustomEvent('vde:products-updated'));
    return result;
  },

  async deleteProduct(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erro ao excluir produto.');
    }
    window.dispatchEvent(new CustomEvent('vde:products-updated'));
    return result;
  },

  // --- Real Multipart Image Upload ---
  async uploadImage(file: File): Promise<{ url: string; filename: string; size: number }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = authStorage.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body: formData
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erro no envio da imagem.');
    }

    return result;
  },

  // --- Admin Authentication ---
  async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Falha ao autenticar.');
    }

    authStorage.setToken(result.token);
    return result;
  },

  async getMe(): Promise<{ user: AdminUser }> {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Sessão inválida');
    }
    return res.json();
  },

  logout(): void {
    authStorage.removeToken();
  },

  // --- Statistics ---
  async getStats(): Promise<AdminStats> {
    const res = await fetch('/api/stats', {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Falha ao carregar métricas.');
    }
    return res.json();
  },

  // --- Store Settings ---
  async getSettings(): Promise<StoreSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) {
      throw new Error('Falha ao carregar configurações.');
    }
    return res.json();
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<{ message: string; settings: StoreSettings }> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erro ao atualizar configurações.');
    }
    return result;
  },

  // --- Orders & Sales ---
  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders', {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error('Falha ao carregar lista de pedidos.');
    }
    return res.json();
  },

  async createOrder(order: Partial<Order>): Promise<{ message: string; order: Order }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erro ao registrar pedido.');
    }
    return result;
  },

  async updateOrderStatus(id: string, status: Order['status'], notes?: string): Promise<{ message: string; order: Order }> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes })
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erro ao atualizar status do pedido.');
    }
    return result;
  },

  async deleteOrder(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erro ao apagar pedido.');
    }
    window.dispatchEvent(new CustomEvent('vde:orders-updated'));
    return result;
  },

  async clearAllOrders(): Promise<{ message: string }> {
    const res = await fetch('/api/orders', {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Erro ao apagar todos os pedidos.');
    }
    window.dispatchEvent(new CustomEvent('vde:orders-updated'));
    return result;
  }
};
