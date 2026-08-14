-- SOLUÇÃO IMEDIATA: Forçar atualização do subadmin samaritanotrader

-- 1. Remover role 'client' incorreta
DELETE FROM user_roles 
WHERE user_id = '5f4597cd-f76b-4028-8dce-45152cb07fcb' 
AND role = 'client';

-- 2. Adicionar role 'sub_admin' correta
INSERT INTO user_roles (user_id, role)
VALUES ('5f4597cd-f76b-4028-8dce-45152cb07fcb', 'sub_admin'::app_role)
ON CONFLICT DO NOTHING;

-- 3. Verificar se foi corrigido
SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.created_at,
    array_agg(ur.role::text) as roles_atuais,
    'CORRIGIDO' as status
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE p.user_id = '5f4597cd-f76b-4028-8dce-45152cb07fcb'
GROUP BY p.user_id, p.full_name, p.email, p.created_at;