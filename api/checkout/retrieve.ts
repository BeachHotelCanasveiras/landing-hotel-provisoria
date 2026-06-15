/**
 * @file retrieve.ts
 * @description Recupera datos de una sesión de Stripe para pre-llenar formularios post-pago.
 * Refactorizado para Express y coherencia de versiones API.
 */
import { Request, Response } from 'express';
import Stripe from 'stripe';

// Inicialización coherente con el resto del proyecto
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2026-05-27.dahlia' 
});

export default async function handler(req: Request, res: Response) {
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
  } catch (error: any) {
    console.error('[Retrieve Session Error]:', error);
    return res.status(500).json({ message: error.message });
  }
}