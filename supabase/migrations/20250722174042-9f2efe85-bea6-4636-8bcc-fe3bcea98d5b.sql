-- Adicionar campo profit_rate na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN profit_rate NUMERIC DEFAULT 5.0;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.profiles.profit_rate IS 'Taxa de lucro em percentagem que o usuário define para calcular lucro diário';