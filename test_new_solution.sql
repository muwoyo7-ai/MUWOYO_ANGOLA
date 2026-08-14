-- Testar a nova solução criando um novo subadmin
-- 1. Verificar o usuário que vai criar o subadmin (deve ser admin)
SELECT 
    ur.user_id,
    ur.role,
    p.email,
    p.full_name
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
WHERE ur.role = 'admin';

-- 2. Simular criação de novo subadmin (execute na aplicação)
-- Mas primeiro vamos verificar se já existe algum subadmin criado recentemente
SELECT 
    ur.user_id,
    ur.role,
    ur.created_at,
    p.email,
    p.full_name,
    p.created_by
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
WHERE ur.role = 'sub_admin'
ORDER BY ur.created_at DESC;

-- 3. Verificar se a constraint única está funcionando
-- Tente inserir uma duplicação (isso deve falhar)
-- INSERT INTO user_roles (user_id, role) VALUES ('ce1037ee-4858-4eb8-adf4-23d8e13002cc', 'client');

-- 4. Verificar a estrutura final das roles
SELECT 
    ur.user_id,
    ur.role,
    ur.created_at,
    p.email,
    p.full_name,
    CASE 
        WHEN p.created_by IS NOT NULL THEN 'Criado por outro usuário'
        ELSE 'Registro normal'
    END as creation_type
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
ORDER BY ur.role, ur.created_at;