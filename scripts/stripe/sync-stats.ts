import 'dotenv/config';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

async function syncStats() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' });
  const reportPath = path.resolve('reports/stripe/stats-report.json');

  const sessions = await stripe.checkout.sessions.list({ limit: 10 });
  const stats = {
    total_volume: sessions.data.reduce((acc, s) => acc + (s.amount_total || 0), 0) / 100,
    count: sessions.data.length,
    last_sync: new Date().toISOString()
  };

  fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
  console.log("📊 Estadísticas de Stripe actualizadas.");
}

syncStats();