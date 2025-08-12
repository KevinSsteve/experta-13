-- Secure the public."New" table by removing public read access and enforcing owner-only access
-- 1) Ensure RLS is enabled (idempotent)
ALTER TABLE public."New" ENABLE ROW LEVEL SECURITY;

-- 2) Drop overly permissive public SELECT policy
DROP POLICY IF EXISTS "Usuários podem ver produtos da tabela New" ON public."New";

-- 3) Create restrictive SELECT policy: only authenticated users can read their own rows
CREATE POLICY "Users can view their own products in New"
ON public."New"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Keep existing INSERT/UPDATE/DELETE policies as-is (already owner-restricted)

-- 4) Performance: index by user_id to avoid seq scans under RLS
CREATE INDEX IF NOT EXISTS idx_new_user_id ON public."New" (user_id);