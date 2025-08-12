-- Secure product_backups: remove public read and restrict to owners/admins
ALTER TABLE public.product_backups ENABLE ROW LEVEL SECURITY;

-- Remove public SELECT policy
DROP POLICY IF EXISTS "Acesso público para visualizar produtos de backup" ON public.product_backups;

-- Owner-only SELECT for authenticated users
CREATE POLICY "Users can view their own product backups"
ON public.product_backups
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Performance: index by user_id
CREATE INDEX IF NOT EXISTS idx_product_backups_user_id ON public.product_backups (user_id);