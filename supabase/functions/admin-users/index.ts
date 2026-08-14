import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const cleanPhone = (v = "") => v.replace(/\D/g, "");
const isEmail = (v = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const allowed = (v: unknown, max = 255) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

async function getActor(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    console.log("getActor: Missing or invalid Authorization header");
    return null;
  }
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data, error: userError } = await client.auth.getUser();
  if (userError || !data.user) {
    console.log("getActor: Failed to get user", userError);
    return null;
  }
  const { data: roleRow, error: roleError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (roleError) {
    console.log("getActor: Error fetching role", roleError);
  }
  if (!roleRow) {
    console.log(
      `getActor: No role found for user ${data.user.id}, creating default role`,
    );
    // Se não houver role, criar role padrão
    await admin
      .from("user_roles")
      .insert({ user_id: data.user.id, role: "client" });
  }
  const role = roleRow?.role || "client";
  console.log(
    `getActor: User ${data.user.id} (${data.user.email}) has role: ${role}`,
  );
  return { admin, user: data.user, role };
}

async function notifyAdmins(
  admin: any,
  fromUserId: string,
  fromEmail: string,
  description: string,
) {
  const { data: admins } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");
  if (!admins) return;
  for (const a of admins) {
    if (a.user_id === fromUserId) continue;
    await admin.from("notifications").insert({
      user_id: a.user_id,
      title: "Movimento do gestor",
      message: `${fromEmail}: ${description}`,
      type: "subadmin_activity",
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  try {
    const actor = await getActor(req);
    console.log(
      `Request from user: ${actor?.user?.id} with role: ${actor?.role}`,
    );
    if (!actor || !["admin", "sub_admin"].includes(actor.role)) {
      console.log(
        `Access denied for user ${actor?.user?.id} with role ${actor?.role}`,
      );
      return json({ error: "unauthorized" }, 401);
    }
    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const admin = actor.admin;

    if (action === "createUser" || action === "createSubadmin") {
      if (action === "createSubadmin" && actor.role !== "admin")
        return json({ error: "admin_only" }, 403);
      const name = allowed(body.name, 120);
      const email = allowed(body.email, 255).toLowerCase();
      const phone = cleanPhone(body.phone || "");
      const password = allowed(body.password, 128);
      if (!name || !isEmail(email) || phone.length < 7 || password.length < 6) {
        return json(
          {
            error: "invalid_input",
            hint: "Email real, telefone (>=7 dígitos), senha (>=6 caracteres) obrigatórios",
          },
          400,
        );
      }
      const created = await admin.auth.admin.createUser({
        email,
        password,
        phone: `+${phone}`,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          phone,
          created_by: actor.user.id,
          is_subadmin: action === "createSubadmin",
        },
      });
      if (created.error) return json({ error: created.error.message }, 400);
      const userId = created.data.user.id;
      const role = action === "createSubadmin" ? "sub_admin" : "client";

      // Primeiro, verificar se já existe uma role para este usuário
      const { data: existingRole } = await admin
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingRole) {
        // Se já existe, atualizar a role
        await admin.from("user_roles").update({ role }).eq("user_id", userId);
      } else {
        // Se não existe, criar a role
        await admin.from("user_roles").insert({ user_id: userId, role });
      }
      await admin
        .from("profiles")
        .update({
          full_name: name,
          phone,
          email,
          business_name: name,
          created_by: actor.user.id,
          message_limit: role === "client" ? 1000 : 0,
          free_messages_granted: role === "client",
          onboarding_completed: role !== "client",
        })
        .eq("user_id", userId);

      if (actor.role === "sub_admin") {
        await notifyAdmins(
          admin,
          actor.user.id,
          actor.user.email || "gestor",
          `cadastrou ${role === "sub_admin" ? "subadmin" : "usuário"}: ${name} (${email})`,
        );
      }
      return json({ ok: true, userId });
    }

    if (action === "addMessages") {
      const userId = allowed(body.userId, 60);
      const amount = Math.max(1, Math.min(1000000, Number(body.amount || 0)));
      if (!userId) return json({ error: "invalid_input" }, 400);
      const { data: prof } = await admin
        .from("profiles")
        .select("message_limit")
        .eq("user_id", userId)
        .maybeSingle();
      const newLimit = Number(prof?.message_limit || 0) + amount;
      await admin
        .from("profiles")
        .update({ message_limit: newLimit })
        .eq("user_id", userId);
      // Re-enable automation if it was paused due to credits
      await admin
        .from("instances")
        .update({ automation_paused: false })
        .eq("user_id", userId);
      await admin.from("notifications").insert({
        user_id: userId,
        title: "Mensagens recarregadas",
        message: `Foram adicionadas ${amount} mensagens. Total: ${newLimit}.`,
        type: "credits_added",
      });
      if (actor.role === "sub_admin") {
        await notifyAdmins(
          admin,
          actor.user.id,
          actor.user.email || "gestor",
          `adicionou ${amount} mensagens ao usuário`,
        );
      }
      return json({ ok: true });
    }

    if (action === "suspendUser") {
      const userId = allowed(body.userId, 60);
      const suspended = !!body.suspended;
      await admin
        .from("profiles")
        .update({
          is_suspended: suspended,
          status: suspended ? "suspended" : "active",
        })
        .eq("user_id", userId);
      if (actor.role === "sub_admin") {
        await notifyAdmins(
          admin,
          actor.user.id,
          actor.user.email || "gestor",
          suspended ? "suspendeu um usuário" : "reativou um usuário",
        );
      }
      return json({ ok: true });
    }

    if (action === "deleteUser") {
      const userId = allowed(body.userId, 60);
      const r = await admin.auth.admin.deleteUser(userId);
      if (r.error) return json({ error: r.error.message }, 400);
      if (actor.role === "sub_admin") {
        await notifyAdmins(
          admin,
          actor.user.id,
          actor.user.email || "gestor",
          "removeu um usuário",
        );
      }
      return json({ ok: true });
    }

    if (action === "updateUser") {
      const userId = allowed(body.userId, 60);
      if (!userId) return json({ error: "invalid_input" }, 400);
      const patch: any = {};
      if (typeof body.full_name === "string")
        patch.full_name = allowed(body.full_name, 120);
      if (typeof body.business_name === "string")
        patch.business_name = allowed(body.business_name, 120);
      if (typeof body.phone === "string") patch.phone = cleanPhone(body.phone);
      if (Object.keys(patch).length)
        await admin.from("profiles").update(patch).eq("user_id", userId);
      const authPatch: any = {};
      if (typeof body.email === "string" && isEmail(body.email))
        authPatch.email = body.email;
      if (typeof body.password === "string" && body.password.length >= 6)
        authPatch.password = body.password;
      if (Object.keys(authPatch).length) {
        const r = await admin.auth.admin.updateUserById(userId, authPatch);
        if (r.error) return json({ error: r.error.message }, 400);
      }
      if (actor.role === "sub_admin")
        await notifyAdmins(
          admin,
          actor.user.id,
          actor.user.email || "gestor",
          "editou um usuário",
        );
      return json({ ok: true });
    }

    if (action === "sendNotification") {
      // Admin → all clients/subadmins (or specific role); subadmin → admins only
      const title = allowed(body.title, 120);
      const message = allowed(body.message, 1000);
      if (!title || !message) return json({ error: "invalid_input" }, 400);
      let targets: { user_id: string }[] = [];
      if (actor.role === "admin") {
        const targetRole = body.targetRole as string | undefined;
        if (targetRole === "all") {
          const { data } = await admin.from("profiles").select("user_id");
          targets = data || [];
        } else if (targetRole === "sub_admin" || targetRole === "client") {
          const { data } = await admin
            .from("user_roles")
            .select("user_id")
            .eq("role", targetRole);
          targets = data || [];
        } else if (body.userId) {
          targets = [{ user_id: body.userId }];
        }
      } else {
        // sub_admin → admins
        const { data } = await admin
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin");
        targets = data || [];
      }
      for (const t of targets) {
        await admin.from("notifications").insert({
          user_id: t.user_id,
          title,
          message,
          type: "broadcast",
          link: body.link || null,
          image_url: body.image_url || null,
        });
      }
      return json({ ok: true, count: targets.length });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (e: any) {
    console.error("admin-users error", e);
    return json({ error: e?.message || "internal" }, 500);
  }
});
