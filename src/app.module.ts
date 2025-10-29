import { ConfigModule } from '@nestjs/config';

import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './database/prisma.module';
import { ProductsModule } from './modules/products/products.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { UserModule } from './modules/user/user.module';
import { OrdersModule } from './modules/orders/orders.module';
import { WebhookController } from './modules/payments/webhooks/webhook.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    ProductsModule,
    CloudinaryModule,
    PaymentsModule,
    UserModule,
    OrdersModule,
  ],
  controllers: [WebhookController],
  providers: [],
})
export class AppModule {}
