import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { IPaymentMethod } from '../interfaces/payment-method.interface';

@Injectable()
export class StripeStrategy implements IPaymentMethod {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createPayment({
    items,
    currency = 'pyg',
    successUrl,
    cancelUrl,
    userId,
  }: {
    items: { name: string; price: number; quantity: number }[];
    currency?: string;
    successUrl: string;
    cancelUrl: string;
    userId: number;
  }) {
    const lineItems = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price, // Stripe usa centavos
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId: userId, items: JSON.stringify(items) },
    });

    return { url: session.url, sessionId: session.id };
  }
  async verifyPayment(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return { paid: session.payment_status === 'paid' };
  }
}
