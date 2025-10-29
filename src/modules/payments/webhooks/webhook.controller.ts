// src/payments/webhook.controller.ts
import { Controller, Post, Req, Res, HttpCode } from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';

import { PrismaService } from 'src/database/prisma.service';
import { OrdersService } from 'src/modules/orders/orders.service';

@Controller('payments')
export class WebhookController {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-09-30.clover',
  });

  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    const secret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(req.body, signature, secret);
    } catch {
      return res.status(400).send('Invalid signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const id = session.id;

      const existing = await this.prisma.order.findUnique({
        where: { stripeSessionId: id },
      });
      if (existing) return res.send({ received: true });

      const userId = Number(session.metadata?.userId);
      const items = JSON.parse(session.metadata?.items ?? '[]') as {
        productId: string;
        quantity: number;
        price: number;
      }[];
      const total = session.amount_total ?? 0;

      await this.ordersService.createOrder(userId, items, total, id);
    }

    return res.send({ received: true });
  }
}
