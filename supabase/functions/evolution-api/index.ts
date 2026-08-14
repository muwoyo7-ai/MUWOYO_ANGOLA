import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EVOLUTION_URL = (Deno.env.get("EVOLUTION_API_URL") || "https://api.muwoyo.com").replace(/\/+$/, "");
const EVOLUTION_KEY = Deno.env.get("EVOLUTION_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/webhook`;

const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const evoFetch = async (path: string, init: RequestInit = {}) => {
  const res = await fetch(`${EVOLUTION_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", apikey: EVOLUTION_KEY, ...(init.headers || {}) },
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  console.log(`[evoFetch] ${init.method || "GET"} ${path} -> ${res.status}`);
  return { ok: res.ok, status: res.status, data };
};

const extractState = (p: any) => p?.instance?.state || p?.state || p?.connectionStatus || null;
const mapState = (s: string | null | undefined) => (s === "open" ? "open" : s === "connecting" ? "connecting" : "disconnected");
const extractQrBase64 = (p: any) => p?.qrcode?.base64 || p?.base64 || p?.qr?.base64 || null;
const extractQrText = (p: any) => p?.qrcode?.code || p?.code || p?.qr?.code || null;
const extractPairingCode = (p: any) => p?.pairingCode || p?.code || p?.pairing?.code || null;

// Get existing instance_name from supabase (do NOT auto-create)
const getStoredInstanceName = async (admin: ReturnType<typeof createClient>, userId: string) => {
  const { data: row } = await admin.from("instances").select("instance_name").eq("user_id", userId).maybeSingle();
  return (row?.instance_name as string | undefined) || null;
};

// Upsert instance row (creates if missing, updates if exists). Used after successful evolution operations.
const saveInstance = async (
  admin: ReturnType<typeof createClient>,
  userId: string,
  instanceName: string,
  patch: Record<string, any>,
) => {
  await admin.from("instances").upsert(
    { user_id: userId, instance_name: instanceName, ...patch },
    { onConflict: "user_id" },
  );
};

// CHECK DIRECTLY ON EVOLUTION (do NOT trust supabase)
const checkEvolutionInstanceExists = async (instanceName: string) => {
  const fetched = await evoFetch(`/instance/fetchInstances?instanceName=${encodeURIComponent(instanceName)}`);
  const arr = Array.isArray(fetched.data) ? fetched.data : (fetched.data ? [fetched.data] : []);
  const found = arr.find((i: any) => {
    const n = i?.name || i?.instance?.instanceName || i?.instanceName;
    return n === instanceName;
  });
  if (found) {
    const state = extractState(found) || found?.connectionStatus || null;
    return { exists: true, state, raw: found };
  }
  return { exists: false, state: null, raw: null };
};

const createEvolutionInstance = async (instanceName: string, phone?: string) => {
  return evoFetch(`/instance/create`, {
    method: "POST",
    body: JSON.stringify({
      instanceName,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
      ...(phone ? { number: phone } : {}),
      webhook: {
        url: WEBHOOK_URL,
        byEvents: false,
        base64: true,
        events: ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
      },
    }),
  });
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!EVOLUTION_KEY) return json({ error: "missing_evolution_key" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const userId = userData.user.id;
    const body = await req.json().catch(() => ({}));
    const { action } = body as { action?: string };
    const phone = body?.phone || body?.phoneNumber || undefined;
    const requestedInstanceName =
      typeof body?.instanceName === "string" && body.instanceName.trim() ? body.instanceName.trim() : null;

    const normalizedAction =
      action === "connect" || action === "getQrCode" ? "createAndConnect"
      : action === "pairing" ? "getPairingCode"
      : action === "status" ? "getStatus"
      : action === "groups" ? "fetchInfo"
      : action;

    if (!normalizedAction) return json({ error: "missing_action" }, 400);

    // Reuse the user's permanent instance_name forever. Only use frontend-generated
    // Muwoyo_XXXXXX when the user has no stored instance yet.
    const storedInstanceName = await getStoredInstanceName(admin, userId);
    const instanceName = storedInstanceName || requestedInstanceName;
    if (!instanceName) {
      return json({ error: "instance_name_required", message: "Frontend deve enviar instanceName" }, 400);
    }

    // ============================================================
    // CONNECT FLOW: verify on evolution -> create if missing -> qr
    // ============================================================
    if (normalizedAction === "createAndConnect") {
      console.log(`[connect] start for instance=${instanceName}`);

      // STEP 1: Check directly on Evolution if instance exists
      let check = await checkEvolutionInstanceExists(instanceName);
      console.log(`[connect] step1 evolution exists=${check.exists} state=${check.state}`);

      // STEP 2: If not, create it on Evolution
      if (!check.exists) {
        console.log(`[connect] step2 creating instance on evolution`);
        const created = await createEvolutionInstance(instanceName, phone);
        if (!created.ok && created.status !== 201 && created.status !== 200 && created.status !== 403) {
          console.error(`[connect] create failed`, created.status, created.data);
          return json({ error: "create_failed", details: created.data, status: created.status }, 500);
        }

        // STEP 3: Confirm creation by re-checking on Evolution
        let confirmed = false;
        for (let i = 0; i < 6 && !confirmed; i++) {
          await wait(1500);
          check = await checkEvolutionInstanceExists(instanceName);
          confirmed = check.exists;
          console.log(`[connect] step3 confirm attempt=${i + 1} exists=${confirmed}`);
        }
        if (!confirmed) {
          return json({ error: "instance_not_confirmed_on_evolution", instanceName }, 500);
        }

        // QR may already be in the create response
        const initialQrBase64 = extractQrBase64(created.data);
        const initialQrText = extractQrText(created.data);
        if (initialQrBase64 || initialQrText) {
          console.log(`[connect] got QR from create response`);
          await saveInstance(admin, userId, instanceName, {
            connection_state: "connecting",
            evolution_state: "connecting",
            phone: phone || null,
            phone_number: phone || null,
            qr_code: initialQrText || initialQrBase64,
            status: "waiting_qr",
          });
          return json({ instanceName, qrBase64: initialQrBase64, qrCodeText: initialQrText, state: "connecting" });
        }
      }

      // Already connected?
      if (mapState(check.state) === "open") {
        await saveInstance(admin, userId, instanceName, {
          connection_state: "open", evolution_state: "open", status: "connected",
        });
        return json({ instanceName, connected: true, state: "open" });
      }

      // STEP 4: Instance exists on Evolution -> request QR via /instance/connect
      console.log(`[connect] step4 requesting QR via /instance/connect`);
      let qrBase64: string | null = null;
      let qrCodeText: string | null = null;

      const initial = await evoFetch(`/instance/connect/${instanceName}`);
      qrBase64 = extractQrBase64(initial.data);
      qrCodeText = extractQrText(initial.data);

      // STEP 5: Poll fetchInstances if QR not yet returned
      for (let i = 0; i < 12 && !qrBase64 && !qrCodeText; i++) {
        await wait(2000);
        const poll = await evoFetch(`/instance/fetchInstances?instanceName=${encodeURIComponent(instanceName)}`);
        const arr = Array.isArray(poll.data) ? poll.data : [poll.data];
        const inst = arr.find((i: any) => (i?.name || i?.instanceName) === instanceName) || arr[0];
        qrBase64 = extractQrBase64(inst) || extractQrBase64(inst?.instance) || extractQrBase64(inst?.qrcode);
        qrCodeText = extractQrText(inst) || extractQrText(inst?.instance) || extractQrText(inst?.qrcode);
        const st = mapState(extractState(inst) || extractState(inst?.instance));
        console.log(`[connect] step5 poll=${i + 1} state=${st} hasQR=${!!(qrBase64 || qrCodeText)}`);
        if (st === "open") {
          await saveInstance(admin, userId, instanceName, {
            connection_state: "open", evolution_state: "open", status: "connected",
          });
          return json({ instanceName, connected: true, state: "open" });
        }
        if (qrBase64 || qrCodeText) break;
        if (i === 5) {
          console.log(`[connect] retrying /instance/connect mid-poll`);
          const retry = await evoFetch(`/instance/connect/${instanceName}`);
          qrBase64 = extractQrBase64(retry.data) || qrBase64;
          qrCodeText = extractQrText(retry.data) || qrCodeText;
        }
      }

      if (!qrBase64 && !qrCodeText) {
        return json({ error: "qr_unavailable", instanceName }, 500);
      }

      await saveInstance(admin, userId, instanceName, {
        connection_state: "connecting",
        evolution_state: "connecting",
        phone: phone || null,
        phone_number: phone || null,
        qr_code: qrCodeText || qrBase64,
        status: "waiting_qr",
      });

      return json({ instanceName, qrBase64, qrCodeText, state: "connecting" });
    }

    // ============================================================
    // PAIRING CODE FLOW
    // ============================================================
    if (normalizedAction === "getPairingCode") {
      if (!phone) return json({ error: "phone_required" }, 400);

      let check = await checkEvolutionInstanceExists(instanceName);
      if (!check.exists) {
        const created = await createEvolutionInstance(instanceName, phone);
        if (!created.ok && created.status !== 201 && created.status !== 200 && created.status !== 403) {
          return json({ error: "create_failed", details: created.data, status: created.status }, 500);
        }
        for (let i = 0; i < 6; i++) {
          await wait(1500);
          check = await checkEvolutionInstanceExists(instanceName);
          if (check.exists) break;
        }
        if (!check.exists) return json({ error: "instance_not_confirmed_on_evolution", instanceName }, 500);
      }

      if (mapState(check.state) === "open") {
        await saveInstance(admin, userId, instanceName, {
          connection_state: "open", evolution_state: "open", status: "connected", phone, phone_number: phone,
        });
        return json({ instanceName, connected: true, state: "open" });
      }

      let pairingCode: string | null = null;
      for (let i = 0; i < 8 && !pairingCode; i++) {
        const [c, p] = await Promise.all([
          evoFetch(`/instance/connect/${instanceName}?number=${encodeURIComponent(phone)}`),
          evoFetch(`/instance/pairingCode/${instanceName}?number=${encodeURIComponent(phone)}`),
        ]);
        pairingCode = extractPairingCode(c.data) || extractPairingCode(p.data);
        if (pairingCode) break;
        await wait(1500);
      }

      if (!pairingCode) return json({ error: "pairing_unavailable", instanceName }, 500);

      await saveInstance(admin, userId, instanceName, {
        connection_state: "connecting", evolution_state: "connecting",
        phone, phone_number: phone, status: "waiting_qr",
      });

      return json({ instanceName, pairingCode, state: "connecting" });
    }

    // ============================================================
    // STATUS
    // ============================================================
    if (normalizedAction === "getStatus") {
      const check = await checkEvolutionInstanceExists(instanceName);
      if (!check.exists) {
        await saveInstance(admin, userId, instanceName, {
          connection_state: "disconnected", evolution_state: "close", status: "disconnected",
        });
        return json({ instanceName, state: "disconnected", raw: "close", exists: false });
      }
      const raw = check.state || "close";
      const state = mapState(raw);
      await saveInstance(admin, userId, instanceName, {
        connection_state: state, evolution_state: raw,
        status: state === "open" ? "connected" : state === "connecting" ? "waiting_qr" : "disconnected",
      });
      return json({ instanceName, state, raw, exists: true });
    }

    // ============================================================
    // FETCH INFO / GROUPS
    // ============================================================
    if (normalizedAction === "fetchInfo" || normalizedAction === "getGroups") {
      const fetched = await evoFetch(`/instance/fetchInstances?instanceName=${encodeURIComponent(instanceName)}`);
      const inst = Array.isArray(fetched.data) ? fetched.data[0] : fetched.data;
      const phoneNum = inst?.ownerJid?.split("@")[0] || inst?.number || inst?.wuid?.split?.("@")[0] || null;
      let groupCount = 0;
      const groups = await evoFetch(`/group/fetchAllGroups/${instanceName}?getParticipants=false`);
      if (Array.isArray(groups.data)) groupCount = groups.data.length;
      if (phoneNum) {
        await saveInstance(admin, userId, instanceName, { phone: phoneNum, phone_number: phoneNum });
      }
      return json({ phone: phoneNum, groupCount });
    }

    // IMPORT CONTACTS FROM EVOLUTION (skip groups)
    if (normalizedAction === "importContacts") {
      const r = await evoFetch(`/chat/findContacts/${instanceName}`, { method: "POST", body: JSON.stringify({ where: {} }) });
      const list: any[] = Array.isArray(r.data) ? r.data : (r.data?.contacts || []);
      let imported = 0;
      for (const c of list) {
        const jid: string = c?.id || c?.remoteJid || c?.jid || "";
        if (!jid || jid.includes("@g.us") || jid.includes("@broadcast") || jid === "status@broadcast") continue;
        const phone = jid.split("@")[0]?.replace(/\D/g, "");
        if (!phone || phone.length < 5) continue;
        const name = c?.pushName || c?.name || c?.notify || c?.verifiedBizName || null;
        await admin.from("whatsapp_contacts").upsert(
          { user_id: userId, instance_name: instanceName, phone_number: phone, name },
          { onConflict: "user_id,phone_number" },
        );
        imported++;
      }
      return json({ ok: true, imported });
    }


    // ============================================================
    // DISCONNECT
    // ============================================================
    if (normalizedAction === "disconnect") {
      await evoFetch(`/instance/logout/${instanceName}`, { method: "DELETE" }).catch(() => null);
      await saveInstance(admin, userId, instanceName, {
        connection_state: "disconnected", evolution_state: "close", status: "disconnected", qr_code: null,
      });
      return json({ ok: true });
    }

    // ============================================================
    // DELETE INSTANCE
    // ============================================================
    if (normalizedAction === "deleteInstance") {
      await evoFetch(`/instance/logout/${instanceName}`, { method: "DELETE" }).catch(() => null);
      await evoFetch(`/instance/delete/${instanceName}`, { method: "DELETE" }).catch(() => null);
      await saveInstance(admin, userId, instanceName, {
        connection_state: "disconnected", evolution_state: "close", status: "disconnected",
        phone: null, phone_number: null, qr_code: null,
      });
      return json({ ok: true });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (e: any) {
    console.error("evolution-api error", e);
    return json({ error: e?.message || "internal" }, 500);
  }
});
