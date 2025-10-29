export interface IPaymentMethod {
  createPayment(params: {
    userId: number;
    amount?: number;
    items?: { name: string; price: number; quantity: number }[];
    currency?: string;
    successUrl?: string;
    cancelUrl?: string;
    metadata?: Record<string, string>; // 👈 opcional, usado en Stripe para userId, items, etc.
  }): Promise<{
    clientSecret?: string; // para métodos tipo PaymentIntent
    url?: string | null; // para Checkout Sessions
    sessionId?: string | null; // 👈 NUEVO: necesario para Stripe Checkout + webhooks
  }>;
}
