import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const subscription = body.subscription;
    const user_id = body.user_id || null;

    if (!subscription || !subscription.endpoint) {
      return json({ error: "subscription object required" }, 400);
    }

    const p256dh = subscription.keys?.p256dh || null;
    const auth = subscription.keys?.auth || null;

    const payload = {
      user_id,
      endpoint: subscription.endpoint,
      p256dh,
      auth,
    };

    const { data, error } = await admin.from("web_push_subscriptions").upsert(payload, { onConflict: "endpoint" }).select().maybeSingle();
    if (error) return json({ error: error.message }, 500);

    return json({ ok: true, subscription: data });
  } catch (err: any) {
    console.error("subscribe function error", err);
    return json({ error: err?.message || "internal" }, 500);
  }
});
