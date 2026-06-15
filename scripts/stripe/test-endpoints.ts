import 'dotenv/config';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

async function testEndpoints() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' });
  const reportPath = path.resolve('reports/stripe/endpoint-report.json');

  try {
    // Intentamos crear una sesión "draft" para probar comunicación sin crear cargos
    await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price_data: { currency: 'brl', product_data: { name: 'Test' }, unit_amount: 100 }, quantity: 1 }],
      mode: 'payment',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    }, { idempotencyKey: 'test-diagnostic-' + Date.now() });

    const report = { timestamp: new Date().toISOString(), status: 'SUCCESS', message: 'API Endpoints operativos.' };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log("✅ Endpoints Stripe operativos.");
  } catch (error: any) {
    console.error("❌ Error en endpoints:", error.message);
  }
}

testEndpoints();