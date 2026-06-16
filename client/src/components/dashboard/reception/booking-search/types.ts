/**
 * @file types.ts
 * @description Contrato estricto de datos para el módulo de Búsqueda de Reservas.
 */

export interface BookingRecord {
  id: string;
  referenceCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
}