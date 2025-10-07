import { Injectable, BadRequestException } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  async checkout(
    userId: number,
    items: { productId: string; quantity: number }[],
  ) {
    // 1. Calcular el total con los precios actuales
    const productIds = items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('Uno o más productos no existen');
    }

    const total = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);

    // 2. Simulación de pago exitoso
    // Aquí iría la integración con Stripe, PayPal, MercadoPago, etc.
    const paymentApproved = true; // <- cambiar por el real
    if (!paymentApproved) {
      throw new BadRequestException('El pago fue rechazado');
    }

    // 3. Crear la orden automáticamente
    const order = await this.ordersService.createOrder({
      userId,
      items,
    });

    return {
      message: 'Pago aprobado y orden creada',
      order,
    };
  }
}
