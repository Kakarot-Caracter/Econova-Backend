import { IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ValidCurrency } from '../interfaces/currency.interface';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsEnum(ValidCurrency, {
    message: `Moneda inválida. Solo se permite: ${Object.values(ValidCurrency).join(', ')}`,
  })
  currency: ValidCurrency;
}
