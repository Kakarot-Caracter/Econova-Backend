import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { OrderStatus } from 'generated/prisma';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(
    userId: number,
    items: { productId: string; quantity: number; price: number }[],
    total: number,
    stripeSessionId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existingOrder = await this.prisma.order.findUnique({
        where: { stripeSessionId },
      });

      if (existingOrder) {
        console.log('La orden ya fue procesada:', stripeSessionId);
        console.log('Detalles de la orden:', existingOrder);
        return existingOrder;
      }
      // --- 1️⃣ Crear la orden principal ---
      const order = await tx.order.create({
        data: {
          userId,
          total,
          stripeSessionId,
          status: OrderStatus.PENDING,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              address: true,
              phone: true,
            },
          },
        },
      });

      // --- 2️⃣ Actualizar stock de productos ---
      // Se hace en el mismo `tx` para asegurar atomicidad.
      for (const item of items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity }, // Previene stock negativo
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          // Si el stock era menor, aborta toda la transacción
          throw new BadRequestException(
            `Stock insuficiente para el producto con ID ${item.productId}`,
          );
        }
      }

      console.log('SE CREO UNA ORDEN');

      // --- 3️⃣ Retornar la orden creada ---
      return order;
    });
  }

  async getAllOrders() {
    return await this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserOrders(userId: number) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
    }

    return await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
