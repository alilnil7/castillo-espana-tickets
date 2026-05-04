// client/src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ticket endpoints
export const getTickets = async () => {
  const response = await api.get('/tickets');
  return response.data;
};

// Update the type to include phone
export const createPaymentIntent = async (data: {
  ticketType: string;
  visitDate: string;
  email: string;
  name: string;
  quantity?: number;
  phone?: string;  // Add phone as optional
}) => {
  const response = await api.post('/payments/create-payment-intent', data);
  return response.data;
};

export const confirmPayment = async (data: {
  paymentIntentId: string;
  sessionId: string;
}) => {
  const response = await api.post('/payments/confirm-payment', data);
  return response.data;
};

export const getTicket = async (ticketId: string) => {
  const response = await api.get(`/payments/ticket/${ticketId}`);
  return response.data;
};

// Map endpoints
export const getMapPoints = async () => {
  const response = await api.get('/map/points');
  return response.data;
};

export const getPointDetails = async (id: string) => {
  const response = await api.get(`/map/points/${id}`);
  return response.data;
};

// Support endpoints
export const getFAQ = async () => {
  const response = await api.get('/support/faq');
  return response.data;
};

// Guide endpoints
export const getGuideContent = async () => {
  const response = await api.get('/guide/content');
  return response.data;
};

export default api;