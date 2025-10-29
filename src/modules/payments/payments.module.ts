import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OrdersModule } from '../orders/orders.module';
import { OrdersService } from '../orders/orders.service';
import { StripeStrategy } from './strategies/stripe.strategy';

@Module({
  imports: [OrdersModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    OrdersService,
    {
      provide: 'IPaymentMethod', // token que coincide con el constructor
      useClass: StripeStrategy, // tu clase concreta
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
