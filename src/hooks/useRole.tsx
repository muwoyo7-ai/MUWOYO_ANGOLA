import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "admin" | "sub_admin" | "client" | null;

const resolveRole = (roles: string[] = []): Exclude<AppRole, null> => {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("sub_admin")) return "sub_admin";
  return "client";
};

export function useRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setRole(resolveRole((data || []).map((r) => r.role)));
        setLoading(false);
      });
  }, [user, authLoading]);

  return { role, loading };
}
