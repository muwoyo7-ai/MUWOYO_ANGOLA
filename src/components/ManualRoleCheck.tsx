import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function ManualRoleCheck({ userId }: { userId: string }) {
  const [roleData, setRoleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const checkRole = async () => {
      setLoading(true);
      try {
        // Verificar na tabela user_roles
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        setRoleData({ data, error: error?.message });
      } catch (error) {
        setRoleData({
          data: null,
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [userId]);

  if (loading)
    return <div className="text-sm text-gray-600">Carregando role...</div>;

  return (
    <div className="text-sm">
      <p>User ID: {userId}</p>
      {roleData?.data ? (
        <p className="text-green-600">Role encontrado: {roleData.data.role}</p>
      ) : (
        <p className="text-red-600">Role não encontrado</p>
      )}
      {roleData?.error && (
        <p className="text-red-600">Erro: {roleData.error}</p>
      )}
    </div>
  );
}
