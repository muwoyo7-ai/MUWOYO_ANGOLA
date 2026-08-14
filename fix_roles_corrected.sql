-- SQL corrigido para tipo enum app_role
-- 1. Ver quem tem roles duplicadas (corrigido para enum)
SELECT user_id, COUNT(*) as total_roles, 
       string_agg(role::text, ', ' ORDER BY role::text) as roles
FROM user_roles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- 2. Ver todas as roles do usuário problemático
SELECT 
    ur.user_id,
    ur.role::text as role,
    ur.created_at,
    p.email,
    p.full_name
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
WHERE ur.user_id = 'ce1037ee-4858-4eb8-adf4-23d8e13002cc';

-- 3. Deletar role "client" quando o usuário também tem "admin" ou "sub_admin"
DELETE FROM user_roles 
WHERE role = 'client'::app_role 
  AND user_id IN (
    SELECT user_id 
    FROM user_roles 
    WHERE role IN ('admin'::app_role, 'sub_admin'::app_role)
  );

-- 4. Verificar se ficou certo
SELECT user_id, role::text as role, created_at
FROM user_roles 
WHERE user_id = 'ce1037ee-4858-4eb8-adf4-23d8e13002cc';