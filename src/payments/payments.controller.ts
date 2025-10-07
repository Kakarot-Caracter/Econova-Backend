import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'generated/prisma';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @Auth(ValidRoles.USER, ValidRoles.ADMIN) // requiere usuario autenticado
  async checkout(
    @Body() body: { items: { productId: string; quantity: number }[] },
    @GetUser() user: User,
  ) {
    return this.paymentsService.checkout(user.id, body.items);
  }
}
