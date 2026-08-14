-- SOLUÇÃO: Alterar valor DEFAULT da coluna message_limit para 1000

-- 1. Alterar o valor padrão da coluna message_limit para 1000
ALTER TABLE profiles 
ALTER COLUMN message_limit SET DEFAULT 1000;

-- 2. Atualizar todos os usuários clientes que ainda têm 500 para 1000
UPDATE profiles 
SET message_limit = 1000 
WHERE message_limit = 500 
AND user_id IN (
    SELECT user_id 
    FROM user_roles 
    WHERE role = 'client'
);

-- 3. Verificar se a alteração funcionou
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.message_limit,
    ur.role,
    CASE 
        WHEN p.message_limit = 1000 THEN 'CORRETO'
        ELSE 'PRECISA ATUALIZAR'
    END as status
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE ur.role = 'client' OR p.message_limit = 500
ORDER BY p.created_at DESC;