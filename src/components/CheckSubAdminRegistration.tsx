import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export function CheckSubAdminRegistration() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkRegistration = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Buscar o usuário pelo email
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, created_by, business_name")
        .eq("email", email)
        .maybeSingle();

      if (userError || !userData) {
        setResult({ error: "Usuário não encontrado" });
        return;
      }

      // Verificar se tem role na tabela user_roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user_id)
        .maybeSingle();

      // Verificar quem criou este usuário
      let creatorInfo = null;
      if (userData.created_by) {
        const { data: creatorData, error: creatorError } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("user_id", userData.created_by)
          .maybeSingle();

        if (creatorData) {
          creatorInfo = creatorData;
        }
      }

      // Verificar se o criador é admin
      let creatorRole = null;
      if (userData.created_by) {
        const { data: creatorRoleData, error: creatorRoleError } =
          await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userData.created_by)
            .maybeSingle();

        if (creatorRoleData) {
          creatorRole = creatorRoleData.role;
        }
      }

      setResult({
        user: userData,
        role: roleData?.role || "Nenhum role encontrado",
        creator: creatorInfo,
        creatorRole: creatorRole || "Nenhum role encontrado",
        isSubAdmin: roleData?.role === "sub_admin",
        wasCreatedByAdmin: creatorRole === "admin",
      });
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardHeader>
        <CardTitle className="text-purple-800">
          Verificar Cadastro de SubAdmin
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-purple-700">Email do usuário:</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite o email do usuário"
            className="border-purple-300"
          />
        </div>

        <Button
          onClick={checkRegistration}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? "Verificando..." : "Verificar Cadastro"}
        </Button>

        {result && (
          <div
            className={`p-3 rounded-lg ${result.error ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
          >
            {result.error ? (
              <p>Erro: {result.error}</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Informações do Usuário:</strong>
                </p>
                <p>Nome: {result.user.full_name}</p>
                <p>Email: {result.user.email}</p>
                <p>User ID: {result.user.user_id}</p>
                <p>Role: {result.role}</p>

                {result.creator && (
                  <>
                    <p>
                      <strong>Informações do Criador:</strong>
                    </p>
                    <p>Nome do Criador: {result.creator.full_name}</p>
                    <p>Email do Criador: {result.creator.email}</p>
                    <p>Role do Criador: {result.creatorRole}</p>
                  </>
                )}

                <p>
                  <strong>Status:</strong>
                </p>
                <p>É SubAdmin? {result.isSubAdmin ? "Sim" : "Não"}</p>
                <p>
                  Foi criado por Admin?{" "}
                  {result.wasCreatedByAdmin ? "Sim" : "Não"}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
