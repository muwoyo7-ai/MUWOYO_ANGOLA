import express from 'express';
import webpush from 'web-push';

const app = express();
app.use(express.json());

const subscriptions = new Map();

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidMailto = process.env.VAPID_MAILTO;

if (!vapidPublicKey || !vapidPrivateKey || !vapidMailto) {
  throw new Error('Defina VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY e VAPID_MAILTO no ambiente.');
}

webpush.setVapidDetails(`mailto:${vapidMailto}`, vapidPublicKey, vapidPrivateKey);

const normalizeSubscription = (subscription = {}) => {
  const keys = subscription.keys || {};
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  };
};

const saveSubscription = (userId, subscription) => {
  const normalized = normalizeSubscription(subscription);
  if (!normalized.endpoint) {
    throw new Error('Subscription inválida.');
  }

  const key = userId || normalized.endpoint;
  subscriptions.set(key, {
    user_id: userId || null,
    subscription: normalized,
  });

  return normalized;
};

app.get('/api/push/health', (_req, res) => {
  res.json({ ok: true, status: 'ready' });
});

app.post('/api/push/subscribe', async (req, res) => {
  try {
    const { user_id, subscription } = req.body;
    const normalized = saveSubscription(user_id || null, subscription);
    return res.status(201).json({ ok: true, subscription: normalized });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Subscription inválida.' });
  }
});

app.get('/api/push/subscriptions', (_req, res) => {
  const list = Array.from(subscriptions.values()).map((entry) => ({
    user_id: entry.user_id,
    endpoint: entry.subscription.endpoint,
  }));

  return res.json({ ok: true, count: list.length, subscriptions: list });
});

app.post('/api/push/send', async (req, res) => {
  try {
    const { user_id, subscription, data } = req.body;
    const stored = subscriptions.get(user_id || subscription?.endpoint);
    const payload = {
      title: data?.title || 'Muwoyo',
      body: data?.body || 'Mensagem enviada pelo backend.',
      icon: data?.icon || '/favicon.ico',
      url: data?.url || '/dashboard',
    };

    if (!stored?.subscription && subscription?.endpoint) {
      const normalized = saveSubscription(user_id || null, subscription);
      const entry = { user_id: user_id || null, subscription: normalized };
      await sendPushNotification(entry.subscription, payload);
      return res.json({ ok: true });
    }

    if (!stored?.subscription) {
      return res.status(404).json({ error: 'Subscription não encontrada.' });
    }

    await sendPushNotification(stored.subscription, payload);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Falha ao enviar push.' });
  }
});

export async function sendPushNotification(subscription, data) {
  await webpush.sendNotification(subscription, JSON.stringify(data));
}

app.listen(3001, () => {
  console.log('Backend Web Push pronto em http://localhost:3001');
});
