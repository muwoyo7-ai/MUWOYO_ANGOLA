import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [checked, setChecked] = useState(false);
  const [suspended, setSuspended] = useState(false);

  useEffect(() => {
    if (!user) { setChecked(true); return; }
    (supabase as any).from("profiles").select("is_suspended,status").eq("user_id", user.id).maybeSingle().then(async ({ data }: any) => {
      if (data?.is_suspended || data?.status === "suspended") {
        setSuspended(true);
        toast({ title: "Conta suspensa", description: "Sua conta foi suspensa. Contacte o administrador.", variant: "destructive" });
        await signOut();
      }
      setChecked(true);
    });
  }, [user]);

  if (loading || !checked) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user || suspended) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
