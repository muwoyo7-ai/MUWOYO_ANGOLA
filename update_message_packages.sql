-- Atualizar pacotes de mensagens com novos valores
-- Small: 500 → 1.000 mensagens
-- Medium: 1.000 → 2.500 mensagens  
-- Medium II: 3.000 → 7.500 mensagens
-- Big: 5.000 → 15.000 mensagens

UPDATE public.top_up_packages 
SET messages = 1000 
WHERE name = 'Muwoyo Small';

UPDATE public.top_up_packages 
SET messages = 2500 
WHERE name = 'Muwoyo Medium';

UPDATE public.top_up_packages 
SET messages = 7500 
WHERE name = 'Muwoyo Medium II';

UPDATE public.top_up_packages 
SET messages = 15000 
WHERE name = 'Muwoyo Big';

-- Verificar se as alterações foram aplicadas
SELECT id, name, messages, price_kz 
FROM public.top_up_packages 
ORDER BY position;