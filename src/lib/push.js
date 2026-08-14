export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser.');
  }

  // Register the service worker (served from /public/sw.js)
  const registration = await navigator.serviceWorker.register('/sw.js');
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!publicKey) throw new Error('VITE_VAPID_PUBLIC_KEY is not set in environment');

  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey
  });

  return subscription;
}
