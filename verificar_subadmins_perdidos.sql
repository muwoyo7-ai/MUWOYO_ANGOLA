-- SQL para verificar usuários criados por admins que só tem role 'client'
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.created_at,
    creator.full_name as criado_por,
    array_agg(ur.role::text) as roles_atuais
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN profiles creator ON p.created_by = creator.user_id
LEFT JOIN user_roles creator_role ON p.created_by = creator_role.user_id AND creator_role.role = 'admin'
WHERE p.created_by IS NOT NULL 
    AND creator_role.role = 'admin' -- foi criado por um admin
GROUP BY p.user_id, p.full_name, p.email, p.created_at, creator.full_name
HAVING array_agg(ur.role::text) = ARRAY['client'] OR array_agg(ur.role::text) IS NULL -- só tem role client ou nenhuma role
ORDER BY p.created_at DESC;