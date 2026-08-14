import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function useDebugRole() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const checkRole = async () => {
      try {
        // Verificar na tabela user_roles
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        // Verificar na tabela profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        // Verificar na tabela auth.users
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        setDebugInfo({
          userId: user.id,
          userEmail: user.email,
          roleFromUserRoles: roleData,
          roleFromProfiles: profileData,
          authUser: authData,
          errors: {
            roleError: roleError?.message,
            profileError: profileError?.message,
            authError: authError?.message,
          },
        });
      } catch (error) {
        setDebugInfo({
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    checkRole();
  }, [user]);

  return debugInfo;
}
