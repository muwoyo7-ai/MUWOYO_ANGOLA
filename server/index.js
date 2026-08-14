import express from 'express';
import bodyParser from 'body-parser';
import webpush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const publicKey = process.env.VITE_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
if (!publicKey || !privateKey) {
  console.warn('VAPID keys not configured in environment. Set VITE_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env.local');
}
webpush.setVapidDetails('mailto:you@yourdomain.com', publicKey, privateKey);

app.post('/api/push/send', async (req, res) => {
  try {
    const { subscription, data } = req.body;
    if (!subscription) return res.status(400).json({ error: 'subscription required' });

    const payload = JSON.stringify(data || { title: 'Muwoyo', body: '' });
    await webpush.sendNotification(subscription, payload);
    return res.json({ ok: true });
  } catch (err) {
    console.error('push send error', err);
    return res.status(500).json({ error: err?.message || 'internal' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Push backend listening on http://localhost:${port}`));
