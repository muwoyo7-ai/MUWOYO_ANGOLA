-- SQL para atualizar mensagens iniciais de 500 para 1000
-- Este SQL muda o limite de mensagens dos usuários que receberam 500 mensagens gratuitas

UPDATE public.profiles 
SET message_limit = 1000 
WHERE free_messages_granted = true AND message_limit = 500;

-- Opcional: Também pode atualizar a notificação para refletir o novo valor
-- UPDATE public.notifications 
-- SET message = 'Você ganhou 1000 mensagens. Quando acabarem, recarregue para continuar.' 
-- WHERE title = '500 mensagens grátis' AND type = 'credits';

-- Verificar quantos usuários foram afetados
SELECT COUNT(*) as usuarios_atualizados
FROM public.profiles 
WHERE free_messages_granted = true AND message_limit = 1000;