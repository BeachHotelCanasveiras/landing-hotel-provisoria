import 'dotenv/config';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

async function testStripeKeys() {
  // Asegúrate de que STRIPE_SECRET_KEY esté definida
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("[Stripe Key Test]: FALTA STRIPE_SECRET_KEY");
    return;
  }

  const stripe = new Stripe(key, { apiVersion: '2026-05-27.dahlia' });
  const reportPath = path.resolve('reports/stripe/connection-report.json');
  
  const report = { timestamp: new Date().toISOString(), status: 'PENDING', details: '' };

  try {
    // stripe.balance.retrieve() es la forma más ligera y universal de verificar 
    // que la API Key tiene permisos de lectura básicos.
    const balance = await stripe.balance.retrieve();
    report.status = 'SUCCESS';
    report.details = `Conexión exitosa. Moneda principal: ${balance.available[0]?.currency || 'N/A'}`;
  } catch (error: any) {
    report.status = 'FAILED';
    report.details = error.message;
  }

  if (!fs.existsSync(path.dirname(reportPath))) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`[Stripe Key Test]: ${report.status} - ${report.details}`);
}

testStripeKeys();