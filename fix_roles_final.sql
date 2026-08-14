-- SQL correto para corrigir roles duplicadas no seu banco
-- 1. Verificar quem tem roles duplicadas
SELECT user_id, COUNT(*) as total_roles
FROM user_roles 
GROUP BY user_id 
HAVING COUNT(*) > 1 
ORDER BY total_roles DESC;

-- 2. Ver todas as roles de cada usuário com duplicação
SELECT user_id, role, created_at, id
FROM user_roles 
WHERE user_id IN (
  SELECT user_id 
  FROM user_roles 
  GROUP BY user_id 
  HAVING COUNT(*) > 1
)
ORDER BY user_id, created_at;

-- 3. Deletar roles duplicadas - manter apenas a role mais importante
-- Para usuários que têm múltiplas roles, deletar a role "client" 
-- se ele também tiver "admin" ou "sub_admin"
DELETE FROM user_roles 
WHERE role = 'client' 
  AND user_id IN (
    SELECT user_id 
    FROM user_roles 
    WHERE role IN ('admin', 'sub_admin')
  );

-- 4. Verificar se ficou certo
SELECT user_id, role, created_at
FROM user_roles 
WHERE user_id IN (
  SELECT user_id 
  FROM user_roles 
  GROUP BY user_id 
  HAVING COUNT(*) > 1
)
ORDER BY user_id, created_at;

-- 5. Verificar usuário específico com problema
SELECT 
    ur.user_id,
    ur.role,
    ur.created_at,
    p.email,
    p.full_name
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
WHERE ur.user_id = 'ce1037ee-4858-4eb8-adf4-23d8e13002cc';