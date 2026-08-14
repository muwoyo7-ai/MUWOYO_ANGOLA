import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkUserRole } from "@/utils/roleChecker";

export function TestSubAdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      // Fazer login
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        setResult({ error: authError.message });
        return;
      }

      // Verificar o role
      const role = await checkUserRole(authData.user.id);

      setResult({
        userId: authData.user.id,
        email: authData.user.email,
        role: role,
        success: true,
      });

      // Fazer logout para não manter o login de teste
      await supabase.auth.signOut();
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800">Testar Login SubAdmin</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-700">
            Email do SubAdmin:
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email do subadmin"
            className="border-blue-300"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-700">Senha:</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="border-blue-300"
          />
        </div>
        <Button
          onClick={handleTestLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "Testando..." : "Testar Login"}
        </Button>

        {result && (
          <div
            className={`p-3 rounded-lg ${result.error ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
          >
            {result.error ? (
              <p>Erro: {result.error}</p>
            ) : (
              <div>
                <p>Login bem-sucedido!</p>
                <p>User ID: {result.userId}</p>
                <p>Email: {result.email}</p>
                <p>Role: {result.role || "Nenhum role encontrado"}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
