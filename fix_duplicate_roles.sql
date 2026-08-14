-- Limpar roles duplicadas no banco de dados
-- Passo 1: Identificar usuários com múltiplas roles
SELECT user_id, COUNT(*) as total_roles, 
       string_agg(role, ', ' ORDER BY role) as roles
FROM user_roles 
GROUP BY user_id 
HAVING COUNT(*) > 1 
ORDER BY total_roles DESC;

-- Passo 2: Para cada usuário, manter apenas a role mais importante (admin > sub_admin > client)
-- Criar uma tabela temporária com as roles a manter
CREATE TEMP TABLE roles_to_keep AS
SELECT DISTINCT ON (user_id) 
    user_id, 
    role,
    id,
    created_at
FROM user_roles 
ORDER BY user_id, 
         CASE role 
           WHEN 'admin' THEN 1 
           WHEN 'sub_admin' THEN 2 
           WHEN 'client' THEN 3 
         END,
         created_at DESC;

-- Passo 3: Deletar as roles duplicadas (mantendo apenas as da tabela temporária)
DELETE FROM user_roles 
WHERE id NOT IN (SELECT id FROM roles_to_keep);

-- Passo 4: Verificar se ficou tudo certo
SELECT user_id, role 
FROM user_roles 
WHERE user_id IN (
  SELECT user_id FROM roles_to_keep
) 
ORDER BY user_id;

-- Passo 5: Dropar a tabela temporária
DROP TABLE roles_to_keep;