-- Verificar estrutura completa do banco de dados
-- 1. Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Ver estrutura da tabela user_roles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- 3. Ver estrutura da tabela profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Ver tipo de dados da coluna role
SELECT table_name, column_name, udt_name 
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'role';