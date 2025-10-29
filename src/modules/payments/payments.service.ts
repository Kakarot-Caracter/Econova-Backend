import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from 'src/database/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { IPaymentMethod } from './interfaces/payment-method.interface';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
    @Inject('IPaymentMethod') private paymentMethod: IPaymentMethod,
  ) {}

  async checkout(userId: number, body: CheckoutDto) {
    const items = body.items;

    //Comprobar si los productos existen
    const itemsId = items.map((item) => item.productId);

    const products = await this.prisma.product.findMany({
      where: { id: { in: itemsId } },
    });

    if (products.length !== itemsId.length) {
      throw new BadRequestException('Uno o más productos no existen');
    }

    //Comprobar stock del producto
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para el producto "${product.name}". Stock disponible: ${product.stock}, solicitado: ${item.quantity}`,
        );
      }
    }

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        name: product.name,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // 👈 obligatorio según el modelo
      };
    });

    const payment = await this.paymentMethod.createPayment({
      items: orderItems,
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel',
      userId: userId,
    });

    console.log(payment);
    //Crea la orden
    //await this.ordersService.createOrder(userId, orderItems, total);

    return { url: payment.url };
  }
}
