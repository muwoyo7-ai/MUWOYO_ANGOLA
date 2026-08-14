import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Bell, LogOut, Search, Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const subItems = [
  { title: "Dashboard", to: "/gestor", icon: BarChart3 },
  { title: "Cadastrar usuário", to: "/gestor/create-user", icon: UserPlus },
  { title: "Meus usuários", to: "/gestor/users", icon: Users },
  { title: "Mensagem ao Admin", to: "/gestor/notify-admin", icon: Bell },
];

function Side() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="flex h-full w-72 flex-col border-r bg-sidebar">
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="text-xl font-bold">Muwoyo Gestor</div>
        <div className="text-xs text-muted-foreground">Painel de gestão</div>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-2">
        {subItems.map((i) => (
          <NavLink
            key={i.title}
            to={i.to}
            end={i.to === "/gestor"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[0.75rem] px-4 py-3 text-sm font-medium transition-colors ${isActive ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"}`
            }
          >
            <i.icon className="h-4 w-4" />
            {i.title}
          </NavLink>
        ))}
      </nav>
      <div className="border-t p-4">
        <div className="mb-3 text-sm font-medium truncate">{user?.email}</div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => {
            signOut();
            navigate("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          Terminar sessão
        </Button>
      </div>
    </aside>
  );
}

export default function SubAdminShell({
  children,
  title,
  search,
  onSearch,
}: {
  children: ReactNode;
  title: string;
  search?: string;
  onSearch?: (v: string) => void;
}) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:fixed lg:inset-y-0 lg:block">
        <Side />
      </div>
      <div className="lg:pl-72 w-full">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur lg:border-none">
          <div className="flex min-h-20 flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="text-sm font-bold text-foreground">
                  Painel de gestão
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  signOut();
                  navigate("/login");
                }}
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <div>
                <h1 className="text-2xl font-bold tracking-normal">{title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search || ""}
                  onChange={(e) => onSearch?.(e.target.value)}
                  placeholder="Pesquisar usuários, telefones..."
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-10 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
