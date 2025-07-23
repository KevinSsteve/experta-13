-- Criar perfil para o usuário atual que não tem perfil
INSERT INTO public.profiles (id, email, name, role, profit_rate)
VALUES (
  '56218a6e-2cfa-41e9-ad74-6aab360c81f4',
  'experta.ao@gmail.com',
  'experta',
  'vendedor',
  5.0
)
ON CONFLICT (id) DO NOTHING;

-- Corrigir a função handle_new_user para usar os valores corretos do enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, profit_rate)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor')::user_role,
    5.0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user function: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();