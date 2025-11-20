import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';

import { OrderStatus, User } from 'generated/prisma';
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

  @Patch(':id')
  @Auth(ValidRoles.ADMIN)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    const updated = await this.ordersService.updateOrderStatus(id, status);
    if (!updated) throw new NotFoundException(`Orden ${id} no encontrada`);
    return updated;
  }

  @Get()
  @Auth(ValidRoles.USER, ValidRoles.ADMIN)
  async findOne(@GetUser() user: User) {
    const orders = await this.ordersService.getUserOrders(user.id);

    return orders;
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMIN)
  async deleteOrder(@Param('id') id: string) {
    const deleted = await this.ordersService.deleteOrder(id);
    if (!deleted) throw new NotFoundException(`Orden ${id} no encontrada`);
    return deleted;
  }
}
