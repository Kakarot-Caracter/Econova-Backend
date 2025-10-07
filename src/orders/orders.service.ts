import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from 'generated/prisma';
import { CreateOrderDto } from './dto/create-order.dto';
import { prismaHandlerError } from 'src/prisma/prisma.errors';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger('OrdersService');

  constructor(private readonly prisma: PrismaService) {}

  async createOrder(data: CreateOrderDto) {
    // 1. Verificar si el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      throw new NotFoundException(
        `Usuario con id ${data.userId} no encontrado`,
      );
    }

    // 2. Obtener información de los productos y validar
    const productIds = data.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Uno o más productos no existen');
    }

    // 3. Validar disponibilidad de stock
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new NotFoundException(`Producto ${item.productId} no encontrado`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para el producto ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
        );
      }
    }

    // 4. Calcular total y preparar items del pedido
    let total = 0;
    const orderItemsData = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      total += product.price * item.quantity;

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price, // Precio histórico
      };
    });

    // 5. Crear el pedido con sus items en una transacción
    try {
      const order = await this.prisma.$transaction(async (prisma) => {
        // Crear el pedido
        const newOrder = await prisma.order.create({
          data: {
            userId: data.userId,
            total,
            status: OrderStatus.PENDING,
            items: {
              create: orderItemsData,
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
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

        // Actualizar el stock de los productos
        for (const item of data.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        return newOrder;
      });

      this.logger.log(
        `Pedido ${order.id} creado exitosamente para el usuario ${data.userId}`,
      );
      return order;
    } catch (error) {
      this.logger.error(`Error al crear el pedido: ${error.message}`);
      throw prismaHandlerError(error);
    }
  }

  async getUserOrders(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
    }

    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
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

    if (!order) {
      throw new NotFoundException(`Pedido con id ${orderId} no encontrado`);
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Pedido con id ${orderId} no encontrado`);
    }

    try {
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(`Estado del pedido ${orderId} actualizado a ${status}`);
      return updatedOrder;
    } catch (error) {
      this.logger.error(
        `Error al actualizar el estado del pedido: ${error.message}`,
      );
      throw prismaHandlerError(error);
    }
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
