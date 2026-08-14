import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  ChartArea,
  CreditCard,
  Menu,
  Settings,
  Store,
  UsersRound,
  ShoppingBag,
  CalendarDays,
  Boxes,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/NotificationBell";
import ProfileSheet from "@/components/ProfileSheet";
import logo from "@/assets/muwoyo-logo.png";

const items = [
  { title: "Dashboard", to: "/dashboard", icon: ChartArea },
  { title: "Informações do negócio", to: "/negocio", icon: Settings },
  { title: "Meu WhatsApp", to: "/whatsapp", icon: UsersRound },
  { title: "Pedidos", to: "/pedidos", icon: ShoppingBag },
  { title: "Minha Agenda", to: "/agenda", icon: CalendarDays },
  { title: "Transferido para humano", to: "/transferido-para-humano", icon: ArrowRightLeft },
  { title: "Meus Produtos", to: "/produtos", icon: Boxes },
  { title: "Minha Loja", to: "/minha-loja", icon: Store },
  { title: "Recarregar mensagens", to: "/recargas", icon: CreditCard },
];

function SidebarContent() {
  const { user } = useAuth();
  return (
    <aside className="flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-20 items-center gap-3 px-6">
        <img src={logo} alt="Muwoyo" className="h-10 w-10 object-contain" />
        <div className="text-2xl font-bold text-foreground">Muwoyo</div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-accent"}`
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <ProfileSheet>
          <button className="flex w-full items-center gap-3 rounded-md bg-accent p-3 text-left transition-colors hover:bg-accent/80">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {(user?.email || "U").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">
                {user?.email?.split("@")[0] || "Usuário"}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {user?.email}
              </div>
            </div>
          </button>
        </ProfileSheet>
      </div>
    </aside>
  );
}

export default function DashboardShell({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description?: string;
}) {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">
        <SidebarContent />
      </div>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-10">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              <div className="flex items-center gap-3 lg:gap-0">
                <img
                  src={logo}
                  alt="Muwoyo"
                  className="h-8 w-8 object-contain lg:hidden"
                />
                <div>
                  <h1 className="text-lg font-bold tracking-normal text-foreground lg:text-2xl">
                    {title}
                  </h1>
                  {description && (
                    <p className="hidden text-sm text-muted-foreground sm:block">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-10 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
