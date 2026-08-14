-- Solução completa para evitar roles duplicadas permanentemente

-- 1. Verificar todas as duplicações atuais
SELECT user_id, COUNT(*) as total_roles,
       array_agg(role ORDER BY role) as roles_array
FROM user_roles 
GROUP BY user_id 
HAVING COUNT(*) > 1 
ORDER BY total_roles DESC;

-- 2. Limpar TODAS as duplicações existentes
-- Para cada usuário, manter apenas a role mais importante (admin > sub_admin > client)
DELETE FROM user_roles 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM user_roles 
  ORDER BY user_id, 
           CASE role 
             WHEN 'admin' THEN 1 
             WHEN 'sub_admin' THEN 2 
             WHEN 'client' THEN 3 
           END
);

-- 3. Verificar se ficou tudo certo
SELECT user_id, role, created_at
FROM user_roles 
ORDER BY user_id;

-- 4. Criar uma constraint única para evitar duplicações futuras
-- Isso garante que cada usuário tenha apenas uma role
ALTER TABLE user_roles 
ADD CONSTRAINT unique_user_role UNIQUE (user_id);

-- 5. Verificar a constraint criada
SELECT constraint_name, table_name, column_name 
FROM information_schema.constraint_column_usage 
WHERE table_name = 'user_roles' 
AND constraint_name = 'unique_user_role';