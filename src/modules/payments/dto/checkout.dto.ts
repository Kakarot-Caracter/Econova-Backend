// src/payments/dto/checkout.dto.ts
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CheckoutItem } from '../interfaces/checkout-item.interface';

export class CheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItem)
  items: CheckoutItem[];
}
