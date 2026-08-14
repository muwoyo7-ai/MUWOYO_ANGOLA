import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || "";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function embed(text: string): Promise<number[] | null> {
  if (!LOVABLE_API_KEY) return null;
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({ model: "google/text-embedding-004", input: text.slice(0, 8000) }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j?.data?.[0]?.embedding || null;
  } catch { return null; }
}

/**
 * Add a knowledge document (RAG) for the current user.
 * Body: { title?: string, content: string, source?: string }
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);
    const client = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: auth } } });
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: u } = await client.auth.getUser();
    if (!u.user) return json({ error: "unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const content = (body.content || "").toString().trim();
    const title = (body.title || "Documento").toString().slice(0, 200);
    const source = (body.source || "manual").toString().slice(0, 50);
    if (!content || content.length < 5) return json({ error: "content_required" }, 400);

    // Chunk long content (~1500 chars per chunk)
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += 1500) chunks.push(content.slice(i, i + 1500));

    let inserted = 0;
    for (const c of chunks) {
      const emb = await embed(c);
      const { error } = await admin.from("ai_documents").insert({
        user_id: u.user.id,
        title,
        content: c,
        source,
        embedding: emb as any,
      });
      if (!error) inserted++;
    }
    return json({ ok: true, inserted, total: chunks.length });
  } catch (e: any) {
    console.error("populate-ai-documents error", e);
    return json({ error: e?.message || "internal" }, 500);
  }
});
