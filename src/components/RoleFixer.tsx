import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface RoleFixerProps {
  userId: string;
  currentRole?: string | null;
  onRoleUpdated?: () => void;
}

export function RoleFixer({
  userId,
  currentRole,
  onRoleUpdated,
}: RoleFixerProps) {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "admin" | "sub_admin" | "client"
  >("client");
  const { toast } = useToast();

  useEffect(() => {
    if (currentRole) {
      setSelectedRole(currentRole as "admin" | "sub_admin" | "client");
    }
  }, [currentRole]);

  const fixRole = async () => {
    setLoading(true);
    try {
      // Primeiro, verificar se já existe uma role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingRole) {
        // Atualizar role existente
        const { error } = await supabase
          .from("user_roles")
          .update({ role: selectedRole })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Criar nova role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: selectedRole });

        if (error) throw error;
      }

      toast({
        title: "Role atualizada com sucesso!",
        description: `O usuário agora tem a role: ${selectedRole}`,
      });

      onRoleUpdated?.();
    } catch (error) {
      console.error("Erro ao atualizar role:", error);
      toast({
        title: "Erro ao atualizar role",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-yellow-500 bg-yellow-50/50">
      <CardHeader>
        <CardTitle className="text-yellow-800">
          ⚠️ Problema de Role Detectado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-yellow-700">
          O usuário não tem uma role definida ou está com problemas. Isso pode
          causar erros ao acessar funcionalidades.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium">Selecionar Role:</label>
          <Select
            value={selectedRole}
            onValueChange={(value) =>
              setSelectedRole(value as "admin" | "sub_admin" | "client")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Client (Usuário Normal)</SelectItem>
              <SelectItem value="sub_admin">Sub Admin (Gestor)</SelectItem>
              <SelectItem value="admin">Admin (Administrador)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={fixRole}
          disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-700"
        >
          {loading ? "Atualizando..." : "Atualizar Role"}
        </Button>

        {currentRole && (
          <p className="text-xs text-yellow-600">
            Role atual: <strong>{currentRole}</strong>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
