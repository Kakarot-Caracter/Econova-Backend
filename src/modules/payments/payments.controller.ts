import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

import { User } from 'generated/prisma';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @Auth(ValidRoles.USER, ValidRoles.ADMIN)
  checkout(@Body() dto: CheckoutDto, @GetUser() user: User) {
    return this.paymentsService.checkout(user.id, dto);
  }

  @Get('verify')
  async verifyPayment(@Query('session_id') sessionId: string) {
    return this.paymentsService.verifyPayment(sessionId);
  }
}
