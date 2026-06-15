/**
 * @file retrieve.ts
 * @description Recupera datos de una sesión de Stripe para pre-llenar formularios post-pago.
 * Refactorizado para Vercel Serverless (VercelRequest/VercelResponse) y libre de 'any' para ESLint v9.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Inicialización de Stripe sincronizada con la API exacta del proyecto
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2026-05-27.dahlia' 
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const sessionId = req.query.session_id as string;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Missing session_id' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return res.status(200).json({
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name || session.metadata?.guest_name || 'Huésped',
    });
  } catch (error: unknown) {
    // Saneamiento de error para ESLint v9 (no-explicit-any resuelto)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[Retrieve Session Error]:', errorMessage);
    return res.status(500).json({ message: errorMessage });
  }
}