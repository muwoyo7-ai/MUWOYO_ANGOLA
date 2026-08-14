import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { initWebPush, notifyBrowserFromApp } from "@/lib/web-push";
import { useToast } from "@/hooks/use-toast";

type Notice = { id: string; title: string; message: string; is_read: boolean | null; image_url?: string | null; link?: string | null; created_at?: string | null };

export default function NotificationBell() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Notice[]>([]);
  const [pushAvailable, setPushAvailable] = useState(false);
  const lastShownNotificationId = useRef<string | null>(null);
  const unread = items.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPushAvailable("serviceWorker" in navigator && "PushManager" in window && "Notification" in window);
  }, []);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("id,title,message,is_read,image_url,link,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
    setItems((data as any) || []);
  };

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    if (!items.length) return;
    const latest = items[0];
    if (!latest || latest.is_read || latest.id === lastShownNotificationId.current) return;
    lastShownNotificationId.current = latest.id;
    void notifyBrowserFromApp(latest.title, latest.message, latest.image_url || undefined, latest.link || undefined);
  }, [items]);

  const handleEnablePush = async () => {
    const result = await initWebPush();
    if (!result.ok) {
      toast({ title: "Notificação não ativada", description: result.reason, variant: "destructive" });
      return;
    }
    toast({ title: "Notificações push ativadas com sucesso", description: "Agora receberás notificações neste dispositivo.", className: "bg-green-50 border-green-200" });
  };

  const markRead = async (id: string) => { await supabase.from("notifications").update({ is_read: true }).eq("id", id); load(); };
  const markAllRead = async () => { if (!user) return; await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false); load(); };

  return (
    <Popover onOpenChange={(o) => o && load()}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,380px)] p-0">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <div className="font-semibold">Notificações</div>
            <p className="text-xs text-muted-foreground">{unread} por ler</p>
          </div>
          <div className="flex items-center gap-2">
            {pushAvailable && <Button variant="ghost" size="sm" onClick={() => void handleEnablePush()}>Ativar push</Button>}
            {unread > 0 && <Button variant="ghost" size="sm" onClick={markAllRead}>Marcar tudo como lido</Button>}
          </div>
        </div>
        <div className="max-h-96 overflow-auto">
          {items.map((n) => (
            <div key={n.id} className="space-y-2 border-b p-4 last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{n.title}</div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                </div>
                {!n.is_read && <Button size="icon" variant="ghost" onClick={() => markRead(n.id)}><Check className="h-4 w-4" /></Button>}
              </div>
              {n.image_url && <img src={n.image_url} alt={n.title} className="max-h-32 rounded-md object-cover" />}
              {n.link && (
                n.link.startsWith("http") ? (
                  <a href={n.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary" onClick={() => markRead(n.id)}>
                    <ExternalLink className="h-3.5 w-3.5" /> Abrir
                  </a>
                ) : (
                  <Link to={n.link} className="inline-flex items-center gap-1 text-sm font-medium text-primary" onClick={() => markRead(n.id)}>
                    <ExternalLink className="h-3.5 w-3.5" /> Abrir
                  </Link>
                )
              )}
            </div>
          ))}
          {items.length === 0 && <div className="p-6 text-sm text-muted-foreground">Nenhuma notificação.</div>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
