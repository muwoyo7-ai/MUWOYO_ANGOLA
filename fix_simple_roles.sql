-- Query simples para corrigir roles duplicadas
-- Passo 1: Ver quem tem roles duplicadas
SELECT user_id, COUNT(*) as total_roles, 
       string_agg(role, ', ' ORDER BY role) as roles
FROM user_roles 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Passo 2: Para cada usuário com múltiplas roles, deletar a role "client" 
-- se ele também tiver "admin" ou "sub_admin"
DELETE FROM user_roles 
WHERE role = 'client' 
  AND user_id IN (
    SELECT user_id 
    FROM user_roles 
    WHERE role IN ('admin', 'sub_admin')
  );

-- Passo 3: Verificar se ficou certo
SELECT user_id, role 
FROM user_roles 
ORDER BY user_id;