import { Controller, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';

import { User } from 'generated/prisma';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Auth } from 'src/common/decorators/auth.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('all')
  @Auth(ValidRoles.ADMIN)
  async getUserOrders() {
    return await this.ordersService.getAllOrders();
  }

  @Get()
  @Auth(ValidRoles.USER, ValidRoles.ADMIN)
  async findOne(@GetUser() user: User) {
    const orders = await this.ordersService.getUserOrders(user.id);

    return orders;
  }
}
