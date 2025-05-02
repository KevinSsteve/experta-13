
-- Migração do Banco de Dados do Projeto Moloja
-- Este arquivo contém todos os comandos SQL necessários para recriar o banco de dados

-- Tipos personalizados
CREATE TYPE IF NOT EXISTS public.user_role AS ENUM ('admin', 'gerente', 'vendedor');

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

-- Função para atualizar a coluna updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualização automática do timestamp em produtos
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualização automática do timestamp em perfis
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor')::user_role
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user function: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil quando um usuário é criado
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar métricas financeiras quando uma nota de crédito é aprovada
CREATE OR REPLACE FUNCTION public.update_financial_metrics_on_credit_note()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        INSERT INTO financial_reports (
            title,
            description,
            report_type,
            period_start,
            period_end,
            total_revenue,
            total_cost,
            total_profit,
            user_id,
            metrics
        ) VALUES (
            'Ajuste de Nota de Crédito',
            'Ajuste automático devido à aprovação da nota de crédito ' || NEW.id,
            'credit_note_adjustment',
            NEW.date::date,
            NEW.date::date,
            -NEW.total,
            0,
            -NEW.total,
            NEW.user_id,
            jsonb_build_object(
                'credit_note_id', NEW.id,
                'original_sale_id', NEW.original_sale_id,
                'reason', NEW.reason
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar métricas financeiras quando uma nota de crédito muda de status
CREATE TRIGGER on_credit_note_approved
AFTER UPDATE ON credit_notes
FOR EACH ROW EXECUTE FUNCTION public.update_financial_metrics_on_credit_note();

-- Políticas de segurança (RLS)
-- Habilitar RLS para as tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meat_cuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_order_lists ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos
CREATE POLICY "Usuários podem ver seus próprios produtos" 
ON products FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios produtos" 
ON products FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios produtos" 
ON products FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios produtos" 
ON products FOR DELETE USING (auth.uid() = user_id);

-- Políticas para vendas
CREATE POLICY "Usuários podem ver suas próprias vendas" 
ON sales FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias vendas" 
ON sales FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para despesas
CREATE POLICY "Usuários podem ver suas próprias despesas" 
ON expenses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias despesas" 
ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias despesas" 
ON expenses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias despesas" 
ON expenses FOR DELETE USING (auth.uid() = user_id);

-- Políticas para perfis
CREATE POLICY "Usuários podem ver seus próprios perfis" 
ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Função auxiliar para verificar papel do usuário
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- Para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Para estatísticas SQL
CREATE EXTENSION IF NOT EXISTS "unaccent";       -- Para busca sem acentos

-- Configurações para busca de texto
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS pt_search (COPY = portuguese);
ALTER TEXT SEARCH CONFIGURATION pt_search ALTER MAPPING FOR hword, hword_part, word WITH unaccent, portuguese_stem;

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Comentários nas tabelas para documentação
COMMENT ON TABLE products IS 'Produtos cadastrados no sistema';
COMMENT ON TABLE sales IS 'Registro de vendas realizadas';
COMMENT ON TABLE expenses IS 'Registro de despesas';
COMMENT ON TABLE profiles IS 'Perfis de usuários do sistema';
COMMENT ON TABLE meat_cuts IS 'Cortes de carne para o açougue';
COMMENT ON TABLE financial_reports IS 'Relatórios financeiros';

-- Configuração para publicação em tempo real (Realtime)
BEGIN;
  -- Adicionar tabelas ao sistema de publicação em tempo real
  INSERT INTO supabase_realtime.subscription (publication, name, tables)
  VALUES ('supabase_realtime', 'moloja_realtime', '{products,sales,expenses}')
  ON CONFLICT (publication, name) DO UPDATE
  SET tables = '{products,sales,expenses}';
  
  -- Habilitar REPLICA IDENTITY FULL para tabelas que precisam de realtime
  ALTER TABLE products REPLICA IDENTITY FULL;
  ALTER TABLE sales REPLICA IDENTITY FULL;
  ALTER TABLE expenses REPLICA IDENTITY FULL;
COMMIT;
