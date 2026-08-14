import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Wallet,
} from "lucide-react";
import AdminShell from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type UserRow = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  business_name: string | null;
  role?: string;
};

const sb = supabase as any;

export default function AdminTokens() {
  return (
    <AdminShell mode="admin" title="Gerenciamento de Tokens & Saldo">
      <Card className="border border-border/60 bg-background text-foreground shadow-sm">
        <CardHeader>
          <CardTitle>Gerenciamento de Tokens & Saldo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">A página de gerenciamento de tokens está disponível em /admin/tokens. Funcionalidade completa desativada nesta instalação.</p>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
