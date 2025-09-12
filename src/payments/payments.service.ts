import { BadRequestException, Injectable } from '@nestjs/common';
import { ValidCurrency } from './interfaces/currency.interface';

@Injectable()
export class PaymentsService {
  private readonly CURRENCY_MIN_AMOUNTS: Record<ValidCurrency, number> = {
    PYG: 10000,
    MXN: 200,
  };

  createPaymentIntent(
    amount: number,
    currency: ValidCurrency = ValidCurrency.PYG,
  ) {
    if (!this.CURRENCY_MIN_AMOUNTS.hasOwnProperty(currency)) {
      throw new BadRequestException(`Unsupported currency: ${currency}`);
    }

    const minimumAmount = this.CURRENCY_MIN_AMOUNTS[currency];

    if (amount < minimumAmount) {
      throw new BadRequestException(
        `Minimum payment is ${minimumAmount} ${currency}`,
      );
    }
    return 'Your Paid ' + amount + ' ' + currency;
  }
}
