-- SQL para verificar todos os usuários que não têm nenhuma role na tabela user_roles
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.created_at,
    p.created_by,
    creator.full_name as criado_por,
    'SEM ROLE' as situacao
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN profiles creator ON p.created_by = creator.user_id
WHERE p.user_id NOT IN (SELECT DISTINCT user_id FROM user_roles)
ORDER BY p.created_at DESC;