
-- Migração do Banco de Dados do Projeto Moloja
-- Este arquivo contém todos os comandos SQL necessários para recriar as tabelas do projeto

-- Tabela: credit_notes
CREATE TABLE IF NOT EXISTS public.credit_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  observations TEXT,
  reason TEXT NOT NULL,
  customer JSONB,
  user_id UUID NOT NULL,
  items JSONB NOT NULL,
  original_sale_id UUID NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total NUMERIC NOT NULL
);

-- Tabela: expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL
);

-- Tabela: financial_metrics
CREATE TABLE IF NOT EXISTS public.financial_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  report_id UUID NOT NULL,
  metadata JSONB,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  percentage_change NUMERIC,
  comparison_value NUMERIC,
  value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: financial_reports
CREATE TABLE IF NOT EXISTS public.financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  total_profit NUMERIC NOT NULL DEFAULT 0,
  metrics JSONB,
  description TEXT,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: meat_cuts
CREATE TABLE IF NOT EXISTS public.meat_cuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_type TEXT NOT NULL,
  description TEXT,
  name TEXT NOT NULL,
  barcode TEXT,
  price_per_kg NUMERIC NOT NULL,
  cost_per_kg NUMERIC NOT NULL,
  stock_weight NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Tabela: products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_public BOOLEAN DEFAULT true,
  purchase_price NUMERIC NOT NULL DEFAULT 0,
  profit_margin NUMERIC,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT DEFAULT '/placeholder.svg',
  stock INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID NOT NULL
);

-- Tabela: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  receipt_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tax_rate NUMERIC DEFAULT 14,
  receipt_show_logo BOOLEAN DEFAULT false,
  receipt_show_signature BOOLEAN DEFAULT false,
  role user_role NOT NULL DEFAULT 'vendedor',
  needs_password_change BOOLEAN DEFAULT false,
  has_changed_password BOOLEAN DEFAULT false,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  position TEXT,
  company_neighborhood TEXT,
  company_city TEXT,
  company_social_media TEXT,
  tax_id TEXT,
  currency TEXT DEFAULT 'AOA',
  receipt_message TEXT,
  receipt_logo TEXT,
  receipt_footer_text TEXT,
  receipt_additional_info TEXT,
  selected_module TEXT
);

-- Tabela: sales
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change NUMERIC NOT NULL,
  amount_paid NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  items JSONB NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  customer TEXT DEFAULT 'Cliente não identificado',
  notes TEXT,
  user_id UUID NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela: storage_objects
CREATE TABLE IF NOT EXISTS public.storage_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bucket_id TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  owner UUID,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela: voice_order_lists
CREATE TABLE IF NOT EXISTS public.voice_order_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto',
  products TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Note: Este arquivo não inclui as restrições de chave estrangeira (FOREIGN KEY) 
-- e políticas de segurança (RLS) que podem existir no banco de dados original.
-- Para uma migração completa, essas definições devem ser adicionadas conforme necessário.
