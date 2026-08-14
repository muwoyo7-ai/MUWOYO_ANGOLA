import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Bell, Coins, LogOut, Menu, Shield, Users, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/NotificationBell";
import ProfileSheet from "@/components/ProfileSheet";
import logo from "@/assets/muwoyo-logo.png";

const adminItems = [{ title: "Dashboard", to: "/admin", icon: BarChart3 }, { title: "Tokens", to: "/admin/tokens", icon: Coins }, { title: "Usuários", to: "/admin?tab=users", icon: Users }, { title: "Subadmins", to: "/admin?tab=subadmins", icon: Shield }, { title: "Notificações", to: "/admin?tab=notifications", icon: Bell }];
const subItems = [{ title: "Dashboard", to: "/gestor", icon: BarChart3 }, { title: "Cadastrar usuário", to: "/gestor?tab=create", icon: UserPlus }, { title: "Meus usuários", to: "/gestor?tab=users", icon: Users }, { title: "Mensagem ao Admin", to: "/gestor?tab=notify", icon: Bell }];

function Side({ mode }: { mode: "admin" | "sub" }) {
  const { user, signOut } = useAuth(); const navigate = useNavigate(); const items = mode === "admin" ? adminItems : subItems;
  return (
    <aside className="flex h-full w-72 flex-col border-r bg-sidebar">
      <div className="flex h-20 items-center gap-3 px-6"><img src={logo} alt="Muwoyo" className="h-10 w-10 object-contain" /><div><div className="text-xl font-bold">{mode === "admin" ? "Muwoyo Admin" : "Muwoyo Gestor"}</div><div className="text-xs text-muted-foreground">Painel de gestão</div></div></div>
      <nav className="flex-1 space-y-1 px-4 py-2">{items.map((i) => <NavLink key={i.title} to={i.to} end={i.to === (mode === "admin" ? "/admin" : "/gestor")} className={({ isActive }) => `flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${isActive ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}><i.icon className="h-4 w-4" />{i.title}</NavLink>)}</nav>
      <div className="space-y-2 border-t p-4">
        <ProfileSheet>
          <button className="flex w-full items-center gap-3 rounded-md bg-accent p-3 text-left transition-colors hover:bg-accent/80">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">{(user?.email || "U").slice(0,1).toUpperCase()}</div>
            <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{user?.email?.split("@")[0]}</div><div className="truncate text-xs text-muted-foreground">{user?.email}</div></div>
          </button>
        </ProfileSheet>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => { signOut(); navigate("/login"); }}><LogOut className="h-4 w-4" />Terminar sessão</Button>
      </div>
    </aside>
  );
}

export default function AdminShell({ children, title, mode, search, onSearch }: { children: ReactNode; title: string; mode: "admin" | "sub"; search?: string; onSearch?: (v: string) => void }) {
  return <div className="min-h-screen bg-background"><div className="hidden lg:fixed lg:inset-y-0 lg:block"><Side mode={mode} /></div><div className="lg:pl-72"><header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur"><div className="flex min-h-20 flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10"><div className="flex items-center gap-3"><Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-5 w-5" /></Button></SheetTrigger><SheetContent side="left" className="w-72 p-0"><Side mode={mode} /></SheetContent></Sheet><div><h1 className="text-2xl font-bold tracking-normal">{title}</h1><p className="text-sm text-muted-foreground">Gestão profissional Muwoyo</p></div></div><div className="flex items-center gap-2"><div className="relative w-full sm:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search || ""} onChange={(e) => onSearch?.(e.target.value)} placeholder="Pesquisar usuários, telefones, instâncias..." className="pl-9" /></div><NotificationBell /></div></div></header><main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-10">{children}</main></div></div>;
}
