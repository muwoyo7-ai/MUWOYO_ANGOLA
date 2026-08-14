import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const N8N_URL = Deno.env.get("N8N_WEBHOOK_URL") || "";
const EVOLUTION_URL = (Deno.env.get("EVOLUTION_API_URL") || "").replace(/\/+$/, "");
const EVOLUTION_KEY = Deno.env.get("EVOLUTION_API_KEY") || "";

const admin = createClient(SUPABASE_URL, SERVICE_KEY);
const ok = (data: Record<string, unknown>) =>
  new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const normalizePhone = (jid = "") => jid.split("@")[0]?.replace(/\D/g, "") || "unknown";
const isGroupJid = (jid = "") => jid.includes("@g.us") || jid.split("@")[0]?.includes("-");

function detectKind(message: any): { kind: string; text: string } {
  if (!message) return { kind: "text", text: "" };
  const text =
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    "";
  if (message.audioMessage) return { kind: "audio", text: text || "[Áudio]" };
  if (message.imageMessage) return { kind: "image", text: text || "[Imagem]" };
  if (message.videoMessage) return { kind: "video", text: text || "[Vídeo]" };
  if (message.documentMessage) return { kind: "document", text: text || "[Documento]" };
  if (message.stickerMessage) return { kind: "sticker", text: "[Sticker]" };
  if (message.locationMessage) return { kind: "location", text: "[Localização]" };
  if (message.contactMessage) return { kind: "contact", text: "[Contato]" };
  return { kind: "text", text };
}

async function fetchAudioBase64(instance: string, messageKey: any): Promise<string | null> {
  if (!EVOLUTION_URL || !EVOLUTION_KEY || !messageKey) return null;
  try {
    const r = await fetch(`${EVOLUTION_URL}/chat/getBase64FromMediaMessage/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVOLUTION_KEY },
      body: JSON.stringify({ message: { key: messageKey } }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j?.base64 || null;
  } catch {
    return null;
  }
}

async function dispatchToN8n(payload: any) {
  if (!N8N_URL) {
    console.warn("N8N_WEBHOOK_URL not configured");
    return false;
  }
  try {
    const res = await fetch(N8N_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (e) {
    console.error("n8n dispatch error", e);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const event = (body?.event || "").toString().toLowerCase().replace(/[._-]/g, "");
    const instanceName = body?.instance || body?.instanceName || body?.data?.instanceName;
    if (!instanceName) return ok({ ok: true, ignored: true });

    const { data: inst } = await admin
      .from("instances")
      .select("user_id, phone, automation_paused, automation_paused_until")
      .eq("instance_name", instanceName)
      .maybeSingle();
    if (!inst) return ok({ ok: true, no_instance: true });
    const userId = inst.user_id as string;
    // Auto-resume if pause timer expired
    if (inst.automation_paused && inst.automation_paused_until && new Date(inst.automation_paused_until).getTime() <= Date.now()) {
      await admin.from("instances").update({ automation_paused: false, automation_paused_until: null }).eq("instance_name", instanceName);
      inst.automation_paused = false;
    }

    if (event === "connectionupdate") {
      const state = body?.data?.state || body?.state;
      const mapped = state === "open" ? "connected" : state === "connecting" ? "connecting" : "disconnected";
      const updates: any = { connection_state: mapped, evolution_state: state, status: mapped };
      const wuid = body?.data?.wuid || body?.data?.ownerJid;
      if (wuid) {
        const phoneNum = normalizePhone(wuid);
        updates.phone = phoneNum;
        updates.phone_number = phoneNum;
      }
      if (mapped === "connected") updates.last_connected_at = new Date().toISOString();
      await admin.from("instances").update(updates).eq("instance_name", instanceName);
    }

    if (event === "messagesupsert" || event === "messagesupdate") {
      const messages = body?.data?.messages || (body?.data ? [body.data] : []);
      const arr = Array.isArray(messages) ? messages : [messages];
      for (const m of arr) {
        if (!m || m?.key?.fromMe === true) continue;
        const remote = m?.key?.remoteJid || "";
        if (isGroupJid(remote)) continue;

        const phoneNumber = normalizePhone(remote);
        const pushName = m?.pushName || m?.verifiedBizName || null;
        const { kind, text } = detectKind(m?.message);
        if (!text) continue;

        await admin.from("whatsapp_contacts").upsert(
          {
            user_id: userId,
            instance_name: instanceName,
            phone_number: phoneNumber,
            name: pushName,
            last_message_at: new Date().toISOString(),
          },
          { onConflict: "user_id,phone_number" },
        );

        // Save inbound message immediately (for history regardless of automation)
        await admin.from("messages").insert({
          user_id: userId,
          phone_number: phoneNumber,
          message_text: text.substring(0, 4000),
          direction: "inbound",
          kind,
          whatsapp_instance_id: instanceName,
          external_id: m?.key?.id || null,
        });

        if (inst.automation_paused === true) continue;

        const { data: blocked } = await admin
          .from("blocked_contacts")
          .select("id")
          .eq("user_id", userId)
          .eq("phone_number", phoneNumber)
          .eq("is_active", true)
          .maybeSingle();
        if (blocked) continue;

        const { data: contact } = await admin
          .from("whatsapp_contacts")
          .select("should_respond")
          .eq("user_id", userId)
          .eq("phone_number", phoneNumber)
          .maybeSingle();
        if (contact?.should_respond === false) continue;

        // Check credits before dispatching to n8n
        const { data: profile } = await admin
          .from("profiles")
          .select("messages_received, message_limit, business_name, business_description, ai_name, ai_rules")
          .eq("user_id", userId)
          .maybeSingle();
        const limit = Number(profile?.message_limit || 0);
        const used = Number(profile?.messages_received || 0);
        if (limit - used <= 0) {
          await admin.from("instances").update({ automation_paused: true }).eq("instance_name", instanceName);
          await admin.from("notifications").insert({
            user_id: userId,
            title: "Mensagens esgotadas",
            message: "A automação foi pausada. Recarregue para reativar.",
            type: "credits_empty",
            link: "/recargas",
          });
          continue;
        }

        // Build n8n payload
        const mediaUrl =
          m?.message?.imageMessage?.url ||
          m?.message?.videoMessage?.url ||
          m?.message?.audioMessage?.url ||
          m?.message?.documentMessage?.url ||
          null;
        const audioBase64 = kind === "audio" ? await fetchAudioBase64(instanceName, m?.key) : null;

        const systemPrompt = [
          profile?.business_name ? `Empresa: ${profile.business_name}` : "",
          profile?.business_description ? `Sobre: ${profile.business_description}` : "",
          profile?.ai_name ? `Você é ${profile.ai_name}, atendente virtual.` : "",
          profile?.ai_rules ? `Regras:\n${profile.ai_rules}` : "",
        ].filter(Boolean).join("\n\n");

        const payload = {
          metadata: {
            instance_name: instanceName,
            remote_jid: remote,
            customer_name: pushName,
            customer_phone: phoneNumber,
            message_type: kind,
            message_id: m?.key?.id,
            user_id: userId,
            callback_url: `${SUPABASE_URL}/functions/v1/n8n-callback`,
            callback_secret: Deno.env.get("N8N_CALLBACK_SECRET") || "",
          },
          message_data: {
            content: text,
            media_url: mediaUrl,
            media_base64: audioBase64,
          },
          business_logic: {
            system_prompt: systemPrompt,
            messages_remaining: limit - used,
          },
        };

        // Enqueue (for safety) and fire-and-forget to n8n
        const { data: queued } = await admin
          .from("message_queue")
          .insert({
            user_id: userId,
            instance_name: instanceName,
            remote_jid: remote,
            payload,
            status: "processing",
          })
          .select("id")
          .single();

        const sent = await dispatchToN8n({ ...payload, metadata: { ...payload.metadata, queue_id: queued?.id } });
        if (!sent && queued?.id) {
          await admin.from("message_queue").update({ status: "pending", last_error: "dispatch_failed" }).eq("id", queued.id);
        }
      }
    }

    return ok({ ok: true });
  } catch (e: any) {
    console.error("webhook error", e);
    return ok({ error: e?.message || "internal" });
  }
});
