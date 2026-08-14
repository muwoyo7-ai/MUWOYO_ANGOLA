import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function CheckSubAdminRole() {
  const { user } = useAuth();
  const [subAdminInfo, setSubAdminInfo] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const checkSubAdmin = async () => {
      try {
        // Verificar se o usuário é um subadmin
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "sub_admin")
          .maybeSingle();

        // Verificar quem criou este usuário (para confirmar se é subadmin)
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("created_by, full_name, business_name")
          .eq("user_id", user.id)
          .maybeSingle();

        // Verificar se existe um admin que criou este subadmin
        const { data: adminData, error: adminError } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .eq("user_id", profileData?.created_by)
          .eq("role", "admin")
          .maybeSingle();

        setSubAdminInfo({
          userId: user.id,
          userEmail: user.email,
          isSubAdmin: roleData?.role === "sub_admin",
          roleData,
          profileData,
          adminData,
          errors: {
            roleError: roleError?.message,
            profileError: profileError?.message,
            adminError: adminError?.message,
          },
        });
      } catch (error) {
        setSubAdminInfo({
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    checkSubAdmin();
  }, [user]);

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
      <h3 className="font-bold text-yellow-800">Verificação de SubAdmin</h3>
      {subAdminInfo ? (
        <div className="mt-2 text-sm">
          <p>User ID: {subAdminInfo.userId}</p>
          <p>Email: {subAdminInfo.userEmail}</p>
          <p>É SubAdmin: {subAdminInfo.isSubAdmin ? "Sim" : "Não"}</p>
          {subAdminInfo.roleData && <p>Role: {subAdminInfo.roleData.role}</p>}
          {subAdminInfo.profileData && (
            <div>
              <p>Nome: {subAdminInfo.profileData.full_name}</p>
              <p>Empresa: {subAdminInfo.profileData.business_name}</p>
              <p>Criado por: {subAdminInfo.profileData.created_by}</p>
            </div>
          )}
          {subAdminInfo.adminData && (
            <p>Admin criador: {subAdminInfo.adminData.user_id}</p>
          )}
          {subAdminInfo.errors.roleError && (
            <p className="text-red-600">
              Erro role: {subAdminInfo.errors.roleError}
            </p>
          )}
          {subAdminInfo.errors.profileError && (
            <p className="text-red-600">
              Erro profile: {subAdminInfo.errors.profileError}
            </p>
          )}
          {subAdminInfo.errors.adminError && (
            <p className="text-red-600">
              Erro admin: {subAdminInfo.errors.adminError}
            </p>
          )}
        </div>
      ) : (
        <p className="text-yellow-700">Carregando...</p>
      )}
    </div>
  );
}
