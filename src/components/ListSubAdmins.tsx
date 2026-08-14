import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listAllSubAdmins } from "@/utils/roleChecker";

export function ListSubAdmins() {
  const [subadmins, setSubadmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAllSubAdmins();
      setSubadmins(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubAdmins();
  }, []);

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader>
        <CardTitle className="text-green-800">Lista de SubAdmins</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={loadSubAdmins}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? "Carregando..." : "Recarregar Lista"}
        </Button>

        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded-lg">
            Erro: {error}
          </div>
        )}

        {subadmins.length === 0 && !loading && !error && (
          <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg">
            Nenhum subadmin encontrado na base de dados
          </div>
        )}

        {subadmins.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-700">
              Total de subadmins: {subadmins.length}
            </p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {subadmins.map((admin, index) => (
                <div
                  key={index}
                  className="p-2 bg-white border border-green-200 rounded text-sm"
                >
                  <p className="font-medium">User ID: {admin.user_id}</p>
                  <p>Role: {admin.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
