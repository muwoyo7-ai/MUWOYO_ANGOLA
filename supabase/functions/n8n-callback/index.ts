import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CALLBACK_SECRET = Deno.env.get("N8N_CALLBACK_SECRET") || "";
const admin = createClient(SUPABASE_URL, SERVICE_KEY);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

/**
 * Called by n8n AFTER it has successfully delivered a message via WhatsApp.
 * Body shape:
 * {
 *   secret: string,
 *   user_id: uuid,
 *   instance_name: string,
 *   remote_jid: string,
 *   phone_number?: string,
 *   sent_text: string,
 *   external_message_id?: string,
 *   queue_id?: uuid,
 *   ai_messages_count?: number  // how many messages the AI actually sent (default 1)
 *   model_id?: string
 *   prompt_tokens?: number
 *   completion_tokens?: number
 *   workflow_name?: string
 *   workflow_id?: string
 * }
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    if (!CALLBACK_SECRET || body?.secret !== CALLBACK_SECRET) return json({ error: "unauthorized" }, 401);

    const userId = body.user_id as string;
    const instanceName = body.instance_name as string;
    const remoteJid = body.remote_jid as string | undefined;
    const phoneNumber = (body.phone_number as string | undefined) || (remoteJid?.split("@")[0]?.replace(/\D/g, "") ?? "");
    const sentText = (body.sent_text as string | undefined) || "";
    const count = Math.max(1, Number(body.ai_messages_count || 1));

    if (!userId || !instanceName || !phoneNumber) return json({ error: "missing_fields" }, 400);

    // Save outbound message(s)
    await admin.from("messages").insert({
      user_id: userId,
      phone_number: phoneNumber,
      message_text: sentText.substring(0, 4000),
      direction: "outbound",
      kind: "text",
      whatsapp_instance_id: instanceName,
      external_id: body.external_message_id || null,
      ai_responded: true,
    });

    const aiModelId = body.model_id as string | undefined;
    const promptTokens = Math.max(0, Number(body.prompt_tokens || 0));
    const completionTokens = Math.max(0, Number(body.completion_tokens || 0));
    const totalTokens = promptTokens + completionTokens;
    const usageCost = await admin.rpc("calculate_usage_cost", {
      p_model_id: aiModelId,
      p_prompt_tokens: promptTokens,
      p_completion_tokens: completionTokens,
    });

    if (aiModelId && (promptTokens > 0 || completionTokens > 0)) {
      await admin.from("ai_usage_events").insert({
        user_id: userId,
        execution_id: body.external_message_id || body.queue_id || null,
        workflow_name: body.workflow_name || "n8n-callback",
        workflow_id: body.workflow_id || null,
        model_id: aiModelId,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        cost_usd: Number(usageCost.data || 0),
      });
    }

    await admin.rpc("recalculate_all_user_ai_balances");

    // Atomically increment messages_received by `count`
    const { data: profile } = await admin
      .from("profiles")
      .select("messages_received, message_limit")
      .eq("user_id", userId)
      .maybeSingle();
    const used = Number(profile?.messages_received || 0);
    const limit = Number(profile?.message_limit || 0);
    const newUsed = used + count;
    await admin.from("profiles").update({ messages_received: newUsed }).eq("user_id", userId);

    const remaining = Math.max(limit - newUsed, 0);

    if (remaining === 50 || (used < 50 && remaining < 50 && remaining > 0)) {
      await admin.from("notifications").insert({
        user_id: userId,
        title: "Restam 50 mensagens",
        message: "Recarregue para continuar a usar a automação sem interrupção.",
        type: "credits_low",
        link: "/recargas",
      });
    }
    if (remaining <= 0) {
      await admin.from("instances").update({ automation_paused: true }).eq("instance_name", instanceName);
      await admin.from("notifications").insert({
        user_id: userId,
        title: "Mensagens esgotadas",
        message: "A automação foi pausada. Recarregue para reativar.",
        type: "credits_empty",
        link: "/recargas",
      });
    }

    if (body.queue_id) {
      await admin.from("message_queue").update({
        status: "delivered",
        external_message_id: body.external_message_id || null,
      }).eq("id", body.queue_id);
    }

    return json({ ok: true, remaining });
  } catch (e: any) {
    console.error("n8n-callback error", e);
    return json({ error: e?.message || "internal" }, 500);
  }
});
