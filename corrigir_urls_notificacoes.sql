-- SOLUÇÃO: Corrigir URLs das notificações de pedidos e agendamentos

-- 1. Corrigir URL de notificações de PEDIDOS
CREATE OR REPLACE FUNCTION public.notify_owner_new_order()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    new.user_id, 
    'Novo pedido recebido', 
    'Cliente: ' || COALESCE(new.customer_name, new.customer_phone, 'desconhecido'), 
    'new_order', 
    '/dashboard/orders'  -- URL CORRIGIDA DE /dashboard/pedidos PARA /dashboard/orders
  );
  RETURN NEW;
END $$;

-- 2. Corrigir URL de notificações de AGENDAMENTOS  
CREATE OR REPLACE FUNCTION public.notify_owner_new_appointment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    new.user_id, 
    'Novo agendamento', 
    'Cliente: ' || COALESCE(new.customer_name, new.customer_phone, 'desconhecido'), 
    'new_appointment', 
    '/dashboard/schedule'  -- URL CORRIGIDA DE /dashboard/agenda PARA /dashboard/schedule
  );
  RETURN NEW;
END $$;

-- 3. Verificar se as triggers estão corretas
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('trg_notify_order', 'trg_notify_appointment');

-- 4. Testar criando uma notificação manual para verificar
SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.link,
    n.created_at
FROM notifications n
WHERE n.type IN ('new_order', 'new_appointment')
ORDER BY n.created_at DESC 
LIMIT 5;