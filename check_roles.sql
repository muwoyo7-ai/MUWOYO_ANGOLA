-- Verificar roles dos usuários
SELECT 
    ur.user_id,
    ur.role,
    p.email,
    p.full_name
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
WHERE ur.user_id = 'ce1037ee-4858-4eb8-adf4-23d8e13002cc'
   OR ur.role IN ('admin', 'sub_admin')
ORDER BY ur.role, p.email;