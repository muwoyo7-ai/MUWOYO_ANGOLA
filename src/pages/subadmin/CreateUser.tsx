import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubAdminShell from "@/components/SubAdminShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type CreateUserBody = {
  action: "createUser";
  name: string;
  phone: string;
  email: string;
  password?: string;
};

export default function CreateUser() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const call = async (body: CreateUserBody) => {
    const { error, data } = await supabase.functions.invoke("admin-users", {
      body,
    });
    if (error || data?.error) {
      toast({
        title: "Erro",
        description: error?.message || data.error,
        variant: "destructive",
      });
      return false;
    }
    toast({ title: "Usuário criado com sucesso!" });
    return true;
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (await call({ action: "createUser", ...form })) {
      setForm({ name: "", phone: "", email: "", password: "" });
      navigate("/gestor/users");
    }
  };

  return (
    <SubAdminShell title="Cadastrar Usuário">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Novo Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={create} className="space-y-4">
            <Input
              required
              placeholder="Nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              required
              placeholder="Número de telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              required
              type="password"
              placeholder="Senha"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" className="w-full">
              Cadastrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </SubAdminShell>
  );
}
