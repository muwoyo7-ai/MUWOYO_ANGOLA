-- Verificar estrutura das tabelas relevantes
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('user_roles', 'profiles')
ORDER BY table_name, ordinal_position;