// client/src/types/index.ts
export interface TicketType {
  id: string;
  name: string;
  price: number;
  currency: string;
}

export interface PaymentIntent {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  sessionId: string;
}

export interface Ticket {
  id: number;
  qrCode: string;
  packName: string;
  quantity: number;
  visitDate: string;
  amount: number;
  email: string;
  name: string;
}

export interface MapPoint {
  id: string;
  title: string;
  lat: number;
  lng: number;
  type: string;
  description?: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}