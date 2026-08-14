ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN IF NOT EXISTS first_login_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS free_messages_granted BOOLEAN DEFAULT false;

ALTER TABLE public.profiles
  ALTER COLUMN message_limit SET DEFAULT 200,
  ALTER COLUMN messages_received SET DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_created_by_idx ON public.profiles(created_by);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles(status);
CREATE INDEX IF NOT EXISTS profiles_phone_idx ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS instances_user_id_idx ON public.instances(user_id);
CREATE INDEX IF NOT EXISTS instances_instance_name_idx ON public.instances(instance_name);
CREATE UNIQUE INDEX IF NOT EXISTS instances_user_id_unique ON public.instances(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS blocked_contacts_user_phone_unique ON public.blocked_contacts(user_id, phone_number);
CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_contacts_user_phone_unique ON public.whatsapp_contacts(user_id, phone_number);

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS sender_id UUID,
  ADD COLUMN IF NOT EXISTS target_role public.app_role,
  ADD COLUMN IF NOT EXISTS target_user_id UUID,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS document_url TEXT,
  ADD COLUMN IF NOT EXISTS link_url TEXT;

CREATE INDEX IF NOT EXISTS notifications_target_user_idx ON public.notifications(target_user_id);
CREATE INDEX IF NOT EXISTS notifications_target_role_idx ON public.notifications(target_role);
CREATE INDEX IF NOT EXISTS notifications_sender_idx ON public.notifications(sender_id);

CREATE OR REPLACE FUNCTION public.is_admin_or_subadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::public.app_role, 'sub_admin'::public.app_role)
  )
$$;

CREATE OR REPLACE FUNCTION public.profile_owned_by_actor(_profile_user_id uuid, _actor_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = _profile_user_id
      AND (p.created_by = _actor_id OR _profile_user_id = _actor_id)
  )
$$;

DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow read access for users and admins on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow update for users and admins on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow delete for admins only on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users and managers can read allowed profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users and managers can update allowed profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can create profiles" ON public.profiles;

CREATE POLICY "Users and managers can read allowed profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR (public.has_role(auth.uid(), 'sub_admin'::public.app_role) AND public.profile_owned_by_actor(user_id, auth.uid()))
);

CREATE POLICY "Users and managers can update allowed profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR (public.has_role(auth.uid(), 'sub_admin'::public.app_role) AND public.profile_owned_by_actor(user_id, auth.uid()))
)
WITH CHECK (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR (public.has_role(auth.uid(), 'sub_admin'::public.app_role) AND public.profile_owned_by_actor(user_id, auth.uid()))
);

CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Managers can create profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'sub_admin'::public.app_role)
);

DROP POLICY IF EXISTS "Usuários autenticados podem ver suas notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários veem apenas suas notificações" ON public.notifications;
DROP POLICY IF EXISTS "users_read_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir suas notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários podem inserir suas notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar suas notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários podem atualizar suas notificações" ON public.notifications;
DROP POLICY IF EXISTS "users_update_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar suas notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários podem deletar suas notificações" ON public.notifications;
DROP POLICY IF EXISTS "Users read targeted notifications" ON public.notifications;
DROP POLICY IF EXISTS "Managers create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;

CREATE POLICY "Users read targeted notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR target_user_id = auth.uid()
  OR (target_role IS NOT NULL AND public.has_role(auth.uid(), target_role))
  OR (target_role IS NULL AND target_user_id IS NULL)
);

CREATE POLICY "Managers create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'sub_admin'::public.app_role)
);

CREATE POLICY "Users update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR target_user_id = auth.uid())
WITH CHECK (user_id = auth.uid() OR target_user_id = auth.uid());

DROP POLICY IF EXISTS "admins_can_view_activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins view all logs and subadmins view own logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Managers create activity logs" ON public.activity_logs;
CREATE POLICY "Admins view all logs and subadmins view own logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR (public.has_role(auth.uid(), 'sub_admin'::public.app_role) AND sub_admin_id = auth.uid())
);

CREATE POLICY "Managers create activity logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'sub_admin'::public.app_role)
);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();