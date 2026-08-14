#!/usr/bin/env node
/**
 * Usage: node server/send-push.js <subscription.json> "Title" "Body"
 * Reads subscription JSON and sends a push notification using web-push.
 */
import fs from 'fs';
import path from 'path';
import webpush from 'web-push';

import 'dotenv/config';

const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: node server/send-push.js <subscription.json> "Title" "Body"');
  process.exit(2);
}

const [subPath, title, body] = args;
const fullPath = path.resolve(process.cwd(), subPath);
if (!fs.existsSync(fullPath)) {
  console.error('Subscription file not found:', fullPath);
  process.exit(2);
}

const raw = fs.readFileSync(fullPath, 'utf8');
const subscription = JSON.parse(raw);

const publicKey = process.env.VITE_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
if (!publicKey || !privateKey) {
  console.error('VAPID keys not found in environment. Set VITE_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env.local');
  process.exit(2);
}

webpush.setVapidDetails('mailto:you@yourdomain.com', publicKey, privateKey);

const payload = JSON.stringify({ title, body, url: '/' });

webpush.sendNotification(subscription, payload).then(() => {
  console.log('Push enviado com sucesso');
}).catch(err => {
  console.error('Erro ao enviar push:', err);
});
