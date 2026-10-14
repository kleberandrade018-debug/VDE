-- ====================================================================
-- ESQUEMA COMPLETO DO BANCO DE DADOS POSTGRESQL (SUPABASE)
-- VAI DE ELÉTRICA - E-COMMERCE & BACK-END ADMINISTRATIVO
-- ====================================================================

-- 1. Criação da Tabela de Scooters / Produtos
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT,
  slug TEXT UNIQUE,
  price NUMERIC(10, 2) NOT NULL,
  promo_price NUMERIC(10, 2),
  power TEXT,
  power_watts INTEGER DEFAULT 1000,
  battery TEXT,
  autonomy TEXT,
  autonomy_km INTEGER DEFAULT 50,
  max_speed TEXT,
  charging_time TEXT,
  max_weight TEXT,
  brakes TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 10,
  is_featured BOOLEAN DEFAULT FALSE,
  is_offer BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  brand TEXT DEFAULT 'Vai de Elétrica',
  badge TEXT,
  images TEXT[] DEFAULT '{}',
  description TEXT,
  features TEXT[] DEFAULT '{}',
  warranty TEXT,
  category TEXT DEFAULT 'Urbana',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);

-- 2. Habilitação de Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política 1: Visitantes anônimos podem ver APENAS produtos publicados
CREATE POLICY "Visitantes podem ler apenas produtos publicados"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (is_published = TRUE);

-- Política 2: Usuários autenticados (administradores) podem ler TODOS os produtos
CREATE POLICY "Admins podem visualizar todos os produtos"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'authenticated');

-- Política 3: Usuários administradores podem INSERIR novos produtos
CREATE POLICY "Admins podem criar produtos"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');

-- Política 4: Usuários administradores podem ATUALIZAR produtos
CREATE POLICY "Admins podem atualizar produtos"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'authenticated')
  WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');

-- Política 5: Usuários administradores podem EXCLUIR produtos
CREATE POLICY "Admins podem excluir produtos"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'authenticated');

-- 3. Configuração do Storage (Balde de Imagens)
-- No Supabase Dashboard > Storage > Criar balde 'scooter-images' como público (Public: true)
-- Políticas para o bucket 'scooter-images':
-- INSERT: Apenas usuários autenticados (admins)
-- SELECT: Público (qualquer pessoa pode carregar as fotos)
