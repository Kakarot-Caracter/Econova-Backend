import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { User } from 'generated/prisma';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Auth(ValidRoles.USER, ValidRoles.ADMIN)
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    // Los usuarios solo pueden crear pedidos para sí mismos
    if (user.role !== ValidRoles.ADMIN && createOrderDto.userId !== user.id) {
      throw new ForbiddenException('Solo puedes crear pedidos para ti mismo');
    }
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get()
  @Auth(ValidRoles.ADMIN)
  findAll() {
    return this.ordersService.getAllOrders();
  }

  @Get('user/:userId')
  @Auth(ValidRoles.USER, ValidRoles.ADMIN)
  getUserOrders(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUser() user: User,
  ) {
    // Los usuarios solo pueden ver sus propios pedidos, los admins pueden ver cualquiera
    if (user.role !== ValidRoles.ADMIN && userId !== user.id) {
      throw new ForbiddenException('Solo puedes ver tus propios pedidos');
    }
    return this.ordersService.getUserOrders(userId);
  }

  @Get(':id')
  @Auth(ValidRoles.USER, ValidRoles.ADMIN)
  async findOne(@Param('id') id: string, @GetUser() user: User) {
    const order = await this.ordersService.getOrderById(id);

    // Los usuarios solo pueden ver sus propios pedidos, los admins pueden ver cualquiera
    if (user.role !== ValidRoles.ADMIN && order.userId !== user.id) {
      throw new ForbiddenException('Solo puedes ver tus propios pedidos');
    }

    return order;
  }

  @Patch(':id/status')
  @Auth(ValidRoles.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      updateOrderStatusDto.status,
    );
  }
}
