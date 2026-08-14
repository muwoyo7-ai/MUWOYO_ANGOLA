// Função para verificar manualmente o role de um usuário
export async function checkUserRole(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Erro ao verificar role:", error);
      return null;
    }

    return data?.role || "client";
  } catch (error) {
    console.error("Erro na verificação:", error);
    return null;
  }
}

// Função para listar todos os subadmins
export async function listAllSubAdmins() {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "sub_admin");

    if (error) {
      console.error("Erro ao listar subadmins:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Erro na listagem:", error);
    return [];
  }
}

// Função para verificar se um usuário existe na tabela user_roles
export async function checkUserExistsInRoles(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Erro ao verificar existência:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Erro na verificação:", error);
    return false;
  }
}
