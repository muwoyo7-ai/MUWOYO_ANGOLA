import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Ban,
  Coins,
  MessageSquarePlus,
  RefreshCw,
  Shield,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import AdminShell from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Row = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  status: string | null;
  is_suspended: boolean | null;
  message_limit: number | null;
  messages_received: number | null;
  created_at: string | null;
  created_by: string | null;
  business_name: string | null;
  instances?: { instance_name?: string | null }[];
  role?: string;
};
type Range = "7" | "14" | "30" | "90";
const sb = supabase as any;

export default function AdminDashboard() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<Row[]>([]);
  const [subs, setSubs] = useState<Row[]>([]);
  const [range, setRange] = useState<Range>("7");
  const [filter, setFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [notice, setNotice] = useState({
    title: "",
    message: "",
    linkUrl: "",
    imageUrl: "",
    documentUrl: "",
    targets: { clients: true, sub_admin: false, admin: false },
    specificUserId: "",
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [edit, setEdit] = useState<Row | null>(null);
  const [msg, setMsg] = useState({ userId: "", amount: "" });
  const [editLimit, setEditLimit] = useState<{ userId: string; limit: string }>({ userId: "", limit: "" });
  
  const load = async () => {
    const { data: profiles } = await sb
      .from("profiles")
      .select(
        "user_id,full_name,phone,status,is_suspended,message_limit,messages_received,created_at,created_by,business_name",
      )
      .order("created_at", { ascending: false });
    const { data: roles } = await sb.from("user_roles").select("user_id,role");
    const roleMap = new Map((roles || []).map((r: any) => [r.user_id, r.role]));
    const rows = (profiles || []).map((p: Row) => ({
      ...p,
      role: roleMap.get(p.user_id) || "client",
    }));
    setUsers(rows.filter((r: Row) => r.role === "client"));
    setSubs(rows.filter((r: Row) => r.role === "sub_admin"));
  };
  

  useEffect(() => {
    load();
  }, []);
  const filtered = users
    .filter((u) =>
      filter === "active"
        ? !u.is_suspended && u.status !== "suspended"
        : filter === "suspended"
          ? u.is_suspended || u.status === "suspended"
          : filter === "empty"
            ? Number(u.message_limit || 0) - Number(u.messages_received || 0) <=
              0
            : true,
    )
    .filter((u) =>
      `${u.full_name || ""} ${u.phone || ""} ${u.business_name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  const chart = useMemo(() => {
    const days = Array.from({ length: Number(range) }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (Number(range) - 1 - i));
      return {
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("pt-PT", {
          day: "2-digit",
          month: "short",
        }),
        count: 0,
      };
    });
    users.forEach((u) => {
      const d = new Date(u.created_at || "").toISOString().slice(0, 10);
      const x = days.find((p) => p.date === d);
      if (x) x.count++;
    });
    return days;
  }, [users, range]);
  const call = async (body: any) => {
    try {
      const { error, data } = await supabase.functions.invoke("admin-users", {
        body,
      });
      if (error || data?.error) {
        console.warn(
          "Function admin-users not available:",
          error?.message || data?.error,
        );
        toast({
          title: "Erro",
          description: error?.message || data?.error,
          variant: "destructive",
        });
        return false;
      }
      toast({ title: "Concluído" });
      load();
      return true;
    } catch (error) {
      console.warn("Function call failed:", error);
      toast({
        title: "Erro crítico",
        description: "Erro ao conectar com o servidor",
        variant: "destructive",
      });
      return false;
    }
  };
  const create = async (e: FormEvent, sub = false) => {
    e.preventDefault();
    if (
      await call({ action: sub ? "createSubadmin" : "createUser", ...form })
    ) {
      setForm({ name: "", email: "", phone: "", password: "" });
      setCreateOpen(false);
      setSubOpen(false);
    }
  };
  const active = users.filter(
      (u) => !u.is_suspended && u.status !== "suspended",
    ).length,
    suspended = users.length - active,
    empty = users.filter(
      (u) =>
        Number(u.message_limit || 0) - Number(u.messages_received || 0) <= 0,
    ).length;
  const submitNotice = async (e: FormEvent) => {
    e.preventDefault();
    const targetRoles = Object.entries(notice.targets)
      .filter(([, v]) => v)
      .map(([k]) => (k === "clients" ? "client" : k));
    if (notice.specificUserId) {
      await call({
        action: "sendNotification",
        title: notice.title,
        message: notice.message,
        userId: notice.specificUserId,
        link: notice.linkUrl || null,
        image_url: notice.imageUrl || null,
      });
    } else {
      for (const r of targetRoles) {
        await call({
          action: "sendNotification",
          title: notice.title,
          message: notice.message,
          targetRole: r,
          link: notice.linkUrl || null,
          image_url: notice.imageUrl || null,
        });
      }
    }
    setNotice({
      title: "",
      message: "",
      linkUrl: "",
      imageUrl: "",
      documentUrl: "",
      targets: { clients: true, sub_admin: false, admin: false },
      specificUserId: "",
    });
  };
  const uploadImage = async (file: File) => {
    const path = `notif/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("notification-images")
      .upload(path, file);
    if (error)
      return toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    const { data } = supabase.storage
      .from("notification-images")
      .getPublicUrl(path);
    setNotice((n) => ({ ...n, imageUrl: data.publicUrl }));
    toast({ title: "Imagem carregada" });
  };
  const allMatches = search.trim()
    ? [...users, ...subs].filter((u) =>
        `${u.full_name || ""} ${u.phone || ""} ${u.business_name || ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : [];
  const allUsersForSelect = [...users, ...subs];
  return (
    <AdminShell
      mode="admin"
      title="Muwoyo Admin"
      search={search}
      onSearch={setSearch}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat
          label="Usuários ativos"
          value={active}
          icon={<Users />}
          onClick={() => setFilter("active")}
        />
        <Stat
          label="Suspendidos"
          value={suspended}
          icon={<Ban />}
          onClick={() => setFilter("suspended")}
        />
        <Stat
          label="Sem mensagens"
          value={empty}
          icon={<MessageSquarePlus />}
          onClick={() => setFilter("empty")}
        />
        <Stat
          label="Ganhos totais"
          value={`${(users.length * 22500).toLocaleString("pt-AO")} Kz`}
          icon={<Coins />}
        />
        <Stat
          label="Mensagens vendidas"
          value={users.reduce((s, u) => s + Number(u.message_limit || 0), 0)}
          icon={<MessageSquarePlus />}
        />
      </div>
      {search.trim() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Resultados da pesquisa: "{search}" ({allMatches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {allMatches.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Nenhum resultado.
              </div>
            )}
            {allMatches.map((u) => (
              <div
                key={u.user_id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <div>
                  <div className="font-medium">
                    {u.full_name || u.business_name || "Usuário"}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({u.role})
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    +{u.phone || ""} · {u.business_name || ""} · ID{" "}
                    {u.user_id.slice(0, 8)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEdit(u)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMsg({ userId: u.user_id, amount: "" })}
                  >
                    Mensagens
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <div className="flex flex-wrap gap-2">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Cadastrar usuário
            </Button>
          </DialogTrigger>
          <UserDialog
            title="Cadastrar usuário"
            form={form}
            setForm={setForm}
            onSubmit={(e) => create(e, false)}
          />
        </Dialog>
        <Dialog open={subOpen} onOpenChange={setSubOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Cadastrar subadmin
            </Button>
          </DialogTrigger>
          <UserDialog
            title="Cadastrar subadmin"
            form={form}
            setForm={setForm}
            onSubmit={(e) => create(e, true)}
          />
        </Dialog>
        <Button variant="ghost" onClick={() => setFilter("all")}>
          Limpar filtro
        </Button>
        <Button variant="outline" onClick={load}>
          Atualizar
        </Button>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Usuários cadastrados por dia</CardTitle>
          <Select value={range} onValueChange={(v) => setRange(v as Range)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["7", "14", "30", "90"].map((v) => (
                <SelectItem key={v} value={v}>
                  {v} dias
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.04}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Area
                dataKey="count"
                stroke="hsl(var(--primary))"
                fill="url(#g)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <UserTable
        title="Todos os usuários"
        rows={filtered}
        onEdit={setEdit}
        onMsg={(u) => setMsg({ userId: u.user_id, amount: "" })}
        onEditLimit={(u) => setEditLimit({ userId: u.user_id, limit: String(u.message_limit || 0) })}
        onSuspend={(u) =>
          call({
            action: "suspendUser",
            userId: u.user_id,
            suspended: !(u.is_suspended || u.status === "suspended"),
          })
        }
        onDelete={(u) => call({ action: "deleteUser", userId: u.user_id })}
      />
      <UserTable
        title="Subadmins"
        rows={subs.filter((s) =>
          `${s.full_name || ""} ${s.phone || ""}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )}
        onEdit={setEdit}
        onMsg={() => {}}
        onEditLimit={(u) => setEditLimit({ userId: u.user_id, limit: String(u.message_limit || 0) })}
        onSuspend={(u) =>
          call({
            action: "suspendUser",
            userId: u.user_id,
            suspended: !(u.is_suspended || u.status === "suspended"),
          })
        }
        onDelete={(u) => call({ action: "deleteUser", userId: u.user_id })}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Enviar notificação em massa</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={submitNotice}>
            <Input
              required
              placeholder="Título"
              value={notice.title}
              onChange={(e) => setNotice({ ...notice, title: e.target.value })}
            />
            <div className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm md:col-span-1">
              <span className="text-muted-foreground">Enviar para:</span>
              {[
                ["clients", "Clientes"],
                ["sub_admin", "Subadmins"],
                ["admin", "Admins"],
              ].map(([k, l]) => (
                <label key={k} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={(notice.targets as any)[k]}
                    onChange={(e) =>
                      setNotice({
                        ...notice,
                        targets: { ...notice.targets, [k]: e.target.checked },
                      })
                    }
                  />
                  {l}
                </label>
              ))}
            </div>
            <Select
              value={notice.specificUserId}
              onValueChange={(v) =>
                setNotice({
                  ...notice,
                  specificUserId: v === "__none__" ? "" : v,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="OU escolher usuário específico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  - Nenhum (usar lista acima) -
                </SelectItem>
                {allUsersForSelect.map((u) => (
                  <SelectItem key={u.user_id} value={u.user_id}>
                    {u.full_name ||
                      u.business_name ||
                      u.phone ||
                      u.user_id.slice(0, 8)}{" "}
                    ({u.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Link opcional"
              value={notice.linkUrl}
              onChange={(e) =>
                setNotice({ ...notice, linkUrl: e.target.value })
              }
            />
            <div className="flex items-center gap-2">
              <Input
                placeholder="Imagem URL ou carregar"
                value={notice.imageUrl}
                onChange={(e) =>
                  setNotice({ ...notice, imageUrl: e.target.value })
                }
              />
              <label className="cursor-pointer rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent">
                Carregar
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && uploadImage(e.target.files[0])
                  }
                />
              </label>
            </div>
            <Textarea
              required
              className="md:col-span-2"
              placeholder="Mensagem"
              value={notice.message}
              onChange={(e) =>
                setNotice({ ...notice, message: e.target.value })
              }
            />
            {notice.imageUrl && (
              <img
                src={notice.imageUrl}
                alt="preview"
                className="md:col-span-2 max-h-40 w-fit rounded-md border"
              />
            )}
            <Button className="w-fit">Enviar notificação</Button>
          </form>
        </CardContent>
      </Card>
      <EditDialog
        row={edit}
        onOpenChange={() => setEdit(null)}
        onSave={(patch) =>
          call({ action: "updateUser", userId: edit?.user_id, ...patch })
        }
      />
      <MsgDialog
        state={msg}
        setState={setMsg}
        onSave={() =>
          call({
            action: "addMessages",
            userId: msg.userId,
            amount: Number(msg.amount),
          })
        }
      />
      <LimitDialog
        state={editLimit}
        setState={setEditLimit}
        onSave={() =>
          call({
            action: "setMessageLimit",
            userId: editLimit.userId,
            limit: Number(editLimit.limit),
          })
        }
      />
    </AdminShell>
  );
}
function Stat({ label, value, icon, onClick }: any) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer border-border/60 shadow-sm"
    >
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className="rounded-md bg-primary/10 p-3 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}
function UserDialog({ title, form, setForm, onSubmit }: any) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          required
          placeholder="Nome completo"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          required
          type="email"
          placeholder="Email real do usuário"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          required
          placeholder="Número de telefone (com DDI)"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
          }
        />
        <Input
          required
          type="password"
          placeholder="Senha (mín. 6)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button className="w-full">Cadastrar</Button>
      </form>
    </DialogContent>
  );
}
function UserTable({ title, rows, onEdit, onMsg, onEditLimit, onSuspend, onDelete }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-3">Nome</th>
              <th>Telefone</th>
              <th>Data</th>
              <th>Mensagens</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u: Row) => (
              <tr key={u.user_id} className="border-b last:border-0">
                <td className="py-3 font-medium">
                  {u.full_name || u.business_name || "Usuário"}
                </td>
                <td>+{u.phone || ""}</td>
                <td>
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString("pt-AO")
                    : "-"}
                </td>
                <td>
                  {Number(u.message_limit || 0) -
                    Number(u.messages_received || 0)}{" "}
                  / {u.message_limit || 0}
                </td>
                <td>
                  {u.is_suspended || u.status === "suspended"
                    ? "Suspenso"
                    : "Ativo"}
                </td>
                <td className="space-x-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => onEdit(u)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onMsg(u)}>
                    Mensagens
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEditLimit(u)}>
                    Limite
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onSuspend(u)}
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(u)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
function EditDialog({ row, onOpenChange, onSave }: any) {
  const [p, setP] = useState<any>({});
  useEffect(() => {
    setP({
      full_name: row?.full_name || "",
      phone: row?.phone || "",
      business_name: row?.business_name || "",
      password: "",
    });
  }, [row]);
  return (
    <Dialog open={!!row} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={p.full_name || ""}
            onChange={(e) => setP({ ...p, full_name: e.target.value })}
          />
          <Input
            value={p.phone || ""}
            onChange={(e) =>
              setP({ ...p, phone: e.target.value.replace(/\D/g, "") })
            }
          />
          <Input
            value={p.business_name || ""}
            onChange={(e) => setP({ ...p, business_name: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Nova senha opcional"
            value={p.password || ""}
            onChange={(e) => setP({ ...p, password: e.target.value })}
          />
          <Button className="w-full" onClick={() => onSave(p)}>
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function MsgDialog({ state, setState, onSave }: any) {
  return (
    <Dialog
      open={!!state.userId}
      onOpenChange={() => setState({ userId: "", amount: "" })}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar mensagens</DialogTitle>
        </DialogHeader>
        <Input
          type="number"
          placeholder="Quantidade"
          value={state.amount}
          onChange={(e) => setState({ ...state, amount: e.target.value })}
        />
        <Button onClick={onSave}>Adicionar</Button>
      </DialogContent>
    </Dialog>
  );
}
function LimitDialog({ state, setState, onSave }: any) {
  return (
    <Dialog
      open={!!state.userId}
      onOpenChange={() => setState({ userId: "", limit: "" })}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar limite de mensagens</DialogTitle>
        </DialogHeader>
        <Input
          type="number"
          placeholder="Limite total"
          value={state.limit}
          onChange={(e) => setState({ ...state, limit: e.target.value })}
        />
        <Button onClick={onSave}>Guardar</Button>
      </DialogContent>
    </Dialog>
  );
}
