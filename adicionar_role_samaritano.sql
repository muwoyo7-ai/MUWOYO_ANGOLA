-- SQL para adicionar role 'sub_admin' especificamente para o usuário samaritano-trader
INSERT INTO user_roles (user_id, role)
VALUES ('22c396ea-ecc4-42ad-b089-df1bb840857e', 'sub_admin'::app_role)
ON CONFLICT DO NOTHING;

-- Verificar se foi adicionado
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    array_agg(ur.role::text) as roles_atuais
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.user_id = '22c396ea-ecc4-42ad-b089-df1bb840857e'
GROUP BY p.user_id, p.full_name, p.email;