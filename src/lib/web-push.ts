import { supabase } from "@/integrations/supabase/client";

export const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export async function persistPushSubscriptionToSupabase(userId: string | null, subscription: PushSubscription) {
  const payload = {
    user_id: userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.getKey("p256dh") ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))) : null,
    auth: subscription.getKey("auth") ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))) : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("web_push_subscriptions")
    .upsert(payload, { onConflict: "endpoint" });

  if (error) {
    throw new Error(error.message || "Falha ao persistir a subscription do browser.");
  }

  return payload;
}

export async function notifyBrowserFromApp(title: string, message: string, icon?: string, url?: string) {
  if (!("serviceWorker" in navigator) || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    body: message,
    icon: icon || "/favicon.ico",
    badge: icon || "/favicon.ico",
    data: { url: url || "/dashboard" },
  });
}

export async function initWebPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return {
      ok: false,
      reason: "Este navegador não suporta Web Push API.",
    };
  }

  if (!("Notification" in window)) {
    return {
      ok: false,
      reason: "Este navegador não suporta notificações nativas.",
    };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      ok: false,
      reason: "Permissão de notificação negada pelo usuário.",
    };
  }

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    return {
      ok: false,
      reason: "A chave pública VAPID não foi configurada no frontend.",
    };
  }

  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  await persistPushSubscriptionToSupabase(session?.user?.id || null, subscription);
  // Subscription is persisted via Supabase client (RLS allows the user to insert their own subscription).

  return {
    ok: true,
    subscription,
  };
}
