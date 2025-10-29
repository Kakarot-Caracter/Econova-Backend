// src/payments/interfaces/checkout-item.interface.ts
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CheckoutItem {
  @IsString()
  productId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
