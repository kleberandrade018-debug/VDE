import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { Database } from './src/server/db';
import { generateToken, requireAdminAuth, verifyToken, AuthenticatedRequest } from './src/server/auth';
import { uploadMiddleware } from './src/server/upload';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Ensure uploads folder exists and serve statically
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// --- API ROUTES ---

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: isProduction ? 'production' : 'development',
    timestamp: new Date().toISOString()
  });
});

// Admin Authentication: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    return;
  }

  const admin = Database.findAdminByEmail(email);
  if (!admin) {
    res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
    return;
  }

  const isValidPassword = Database.verifyAdminPassword(admin, password);
  if (!isValidPassword) {
    res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
    return;
  }

  const token = generateToken(admin);

  res.json({
    message: 'Login realizado com sucesso.',
    token,
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      createdAt: admin.createdAt
    }
  });
});

// Admin Authentication: Verify current session
app.get('/api/auth/me', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.adminUser
  });
});

// Admin Authentication: Logout
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Sessão encerrada com sucesso.' });
});

// Admin Authentication: Change Password
app.post('/api/auth/change-password', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: 'A nova senha deve possuir no mínimo 6 caracteres.' });
    return;
  }

  const email = req.adminUser!.email;
  const admin = Database.findAdminByEmail(email);
  if (!admin || !Database.verifyAdminPassword(admin, currentPassword)) {
    res.status(400).json({ error: 'Senha atual incorreta.' });
    return;
  }

  Database.updateAdminPassword(email, newPassword);
  res.json({ message: 'Senha atualizada com sucesso.' });
});

// Products: List
// If Authorization header with valid admin token is present, returns all products including hidden.
// Otherwise, returns only published products (isPublished !== false).
app.get('/api/products', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
  const isAdmin = token ? !!verifyToken(token) : false;

  const products = Database.getProducts(isAdmin);
  res.json(products);
});

// Products: Get Single
app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = Database.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Produto não encontrado.' });
    return;
  }
  res.json(product);
});

// Products: Create
app.post('/api/products', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, price } = req.body;

  if (!name || name.trim() === '') {
    res.status(400).json({ error: 'O nome do modelo é obrigatório.' });
    return;
  }
  if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
    res.status(400).json({ error: 'Informe um preço válido maior que zero.' });
    return;
  }

  const created = Database.saveProduct(req.body);
  res.status(201).json({
    message: 'Scooter cadastrada com sucesso.',
    product: created
  });
});

// Products: Update
app.put('/api/products/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const existing = Database.getProductById(id);
  if (!existing) {
    res.status(404).json({ error: 'Produto não encontrado para atualização.' });
    return;
  }

  const { name, price } = req.body;
  if (!name || name.trim() === '') {
    res.status(400).json({ error: 'O nome do modelo é obrigatório.' });
    return;
  }
  if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
    res.status(400).json({ error: 'Informe um preço válido maior que zero.' });
    return;
  }

  const updated = Database.saveProduct({ ...req.body, id });
  res.json({
    message: 'Scooter atualizada com sucesso.',
    product: updated
  });
});

// Products: Toggle Published / Hidden Status
app.patch('/api/products/:id/status', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { isPublished } = req.body;

  if (isPublished === undefined) {
    res.status(400).json({ error: 'Status isPublished deve ser true ou false.' });
    return;
  }

  const updated = Database.toggleProductStatus(id, Boolean(isPublished));
  if (!updated) {
    res.status(404).json({ error: 'Produto não encontrado.' });
    return;
  }

  res.json({
    message: isPublished ? 'Produto publicado na loja com sucesso.' : 'Produto ocultado da loja com sucesso.',
    product: updated
  });
});

// Products: Delete
app.delete('/api/products/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = Database.deleteProduct(id);
  if (!success) {
    res.status(404).json({ error: 'Produto não encontrado para exclusão.' });
    return;
  }

  res.json({
    message: 'Produto excluído permanentemente com sucesso.',
    id
  });
});

// Image Upload: Real Multipart File Upload with resilient error handling
app.post(
  '/api/upload',
  requireAdminAuth,
  (req: AuthenticatedRequest, res: Response) => {
    uploadMiddleware.single('image')(req, res, (err: any) => {
      if (err) {
        console.error('Upload error:', err.message);
        res.status(400).json({ error: err.message || 'Falha ao processar arquivo de imagem.' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'Nenhum arquivo de imagem foi recebido pelo servidor.' });
        return;
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        message: 'Upload concluído com sucesso.',
        url: fileUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    });
  }
);

// Admin Stats
app.get('/api/stats', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const stats = Database.getStats();
  res.json(stats);
});

// Store Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(Database.getSettings());
});

app.put('/api/settings', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = Database.saveSettings(req.body);
  res.json({
    message: 'Configurações da loja atualizadas com sucesso.',
    settings: updated
  });
});

// Orders & Sales: List Orders (Admin only)
app.get('/api/orders', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  const orders = Database.getOrders();
  res.json(orders);
});

// Orders & Sales: Create new Order (Public checkout or admin)
app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, items, total } = req.body;
  if (!customer || !customer.name || !items || total === undefined) {
    res.status(400).json({ error: 'Dados incompletos do pedido.' });
    return;
  }
  const order = Database.saveOrder(req.body);
  res.status(201).json({
    message: 'Pedido registrado com sucesso.',
    order
  });
});

// Orders & Sales: Update Status / Confirm Payment (Admin only)
app.patch('/api/orders/:id/status', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { status, notes } = req.body;
  if (!status) {
    res.status(400).json({ error: 'Status do pedido é obrigatório.' });
    return;
  }
  const updated = Database.updateOrderStatus(req.params.id, status, notes);
  if (!updated) {
    res.status(404).json({ error: 'Pedido não encontrado.' });
    return;
  }
  res.json({
    message: 'Status do pedido atualizado com sucesso.',
    order: updated
  });
});

// Orders & Sales: Delete Order by ID (Admin only)
app.delete('/api/orders/:id', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = Database.deleteOrder(id);
  if (!success) {
    res.status(404).json({ error: 'Pedido não encontrado para exclusão.' });
    return;
  }
  res.json({
    message: 'Pedido apagado com sucesso.',
    id
  });
});

// Orders & Sales: Clear All Orders (Admin only)
app.delete('/api/orders', requireAdminAuth, (_req: AuthenticatedRequest, res: Response) => {
  Database.clearOrders();
  res.json({
    message: 'Todos os pedidos foram apagados com sucesso.'
  });
});

// Global Error Handler for API
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Erro interno no servidor.'
  });
});

// --- VITE OR STATIC SERVING ---
async function startServer() {
  if (isProduction && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    console.log('Serving production build from ./dist');
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('Starting Vite in middleware mode for development...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Vai de Elétrica Full-Stack Server running on port ${PORT}`);
    console.log(`👉 API ready at http://0.0.0.0:${PORT}/api/products`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
