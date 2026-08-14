-- SQL para verificar e corrigir roles de usuários que foram criados como subadmins mas só tem role 'client'

-- Primeiro, vamos verificar quais usuários foram criados por admins (potenciais subadmins)
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.created_at,
    p.created_by,
    creator.full_name as criado_por,
    array_agg(ur.role::text) as roles_atuais
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN profiles creator ON p.created_by = creator.user_id
LEFT JOIN user_roles creator_role ON p.created_by = creator_role.user_id AND creator_role.role = 'admin'
WHERE p.created_by IS NOT NULL 
    AND creator_role.role = 'admin' -- foi criado por um admin
GROUP BY p.user_id, p.full_name, p.email, p.created_at, p.created_by, creator.full_name
HAVING array_agg(ur.role::text) = ARRAY['client'] OR array_agg(ur.role::text) IS NULL -- só tem role client ou nenhuma role
ORDER BY p.created_at DESC;

-- SQL para corrigir: adicionar role 'sub_admin' para usuários criados por admins que só tem 'client'
INSERT INTO user_roles (user_id, role)
SELECT DISTINCT p.user_id, 'sub_admin'::app_role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN user_roles creator_role ON p.created_by = creator_role.user_id AND creator_role.role = 'admin'
WHERE p.created_by IS NOT NULL 
    AND creator_role.role = 'admin' -- foi criado por um admin
    AND NOT EXISTS (
        SELECT 1 FROM user_roles ur2 
        WHERE ur2.user_id = p.user_id AND ur2.role = 'sub_admin'
    )
    AND EXISTS (
        SELECT 1 FROM user_roles ur3 
        WHERE ur3.user_id = p.user_id AND ur3.role = 'client'
    );

-- Verificar se a correção funcionou
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.created_at,
    array_agg(ur.role::text) as roles_atuais
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN user_roles creator_role ON p.created_by = creator_role.user_id AND creator_role.role = 'admin'
WHERE p.created_by IS NOT NULL 
    AND creator_role.role = 'admin'
GROUP BY p.user_id, p.full_name, p.email, p.created_at
ORDER BY p.created_at DESC;