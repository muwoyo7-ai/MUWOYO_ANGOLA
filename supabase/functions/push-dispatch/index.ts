import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEB_PUSH_BACKEND_URL = Deno.env.get("WEB_PUSH_BACKEND_URL") || "";

const admin = createClient(SUPABASE_URL, SERVICE_KEY);
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const notificationId = body.notification_id || body.id;
    const userId = body.user_id;

    if (!WEB_PUSH_BACKEND_URL) {
      return json({ error: "WEB_PUSH_BACKEND_URL não configurado" }, 400);
    }

    let notification: any = null;

    if (notificationId) {
      const { data, error } = await admin
        .from("notifications")
        .select("id,user_id,title,message,image_url,link,type,created_at")
        .eq("id", notificationId)
        .maybeSingle();

      if (error) return json({ error: error.message }, 400);
      notification = data;
    }

    if (!notification && userId) {
      const { data, error } = await admin
        .from("notifications")
        .select("id,user_id,title,message,image_url,link,type,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return json({ error: error.message }, 400);
      notification = data;
    }

    if (!notification) {
      return json({ error: "notification not found" }, 404);
    }

    const { data: subscriptions } = await admin
      .from("web_push_subscriptions")
      .select("endpoint,p256dh,auth,user_id")
      .eq("user_id", notification.user_id);

    const dispatches = await Promise.all(
      (subscriptions || []).map(async (subscription: any) => {
        const payload = {
          title: notification.title || "Muwoyo",
          body: notification.message || "",
          icon: notification.image_url || "/favicon.ico",
          url: notification.link || "/dashboard",
        };

        const response = await fetch(`${WEB_PUSH_BACKEND_URL}/api/push/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: subscription.user_id,
            subscription: {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            data: payload,
          }),
        });

        return {
          endpoint: subscription.endpoint,
          status: response.status,
          ok: response.ok,
        };
      }),
    );

    return json({ ok: true, notification_id: notification.id, dispatches });
  } catch (error: any) {
    console.error("push-dispatch error", error);
    return json({ error: error?.message || "internal" }, 500);
  }
});
