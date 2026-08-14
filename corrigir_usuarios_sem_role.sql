-- SQL para adicionar role 'sub_admin' para usuários criados por admins que não têm nenhuma role
INSERT INTO user_roles (user_id, role)
SELECT DISTINCT p.user_id, 'sub_admin'::app_role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN user_roles creator_role ON p.created_by = creator_role.user_id AND creator_role.role = 'admin'
WHERE p.user_id NOT IN (SELECT DISTINCT user_id FROM user_roles) -- usuários sem nenhuma role
    AND p.created_by IS NOT NULL 
    AND creator_role.role = 'admin'; -- foi criado por um admin

-- Verificar se a correção funcionou
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.created_at,
    array_agg(ur.role::text) as roles_atuais,
    creator.full_name as criado_por
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN profiles creator ON p.created_by = creator.user_id
WHERE p.created_by IS NOT NULL 
    AND p.created_by IN (SELECT user_id FROM user_roles WHERE role = 'admin')
GROUP BY p.user_id, p.full_name, p.email, p.created_at, creator.full_name
ORDER BY p.created_at DESC;