import { Controller, Get, Patch, Body, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

import { User } from 'generated/prisma';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { Auth } from 'src/common/decorators/auth.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Auth(ValidRoles.USER, ValidRoles.ADMIN)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth(ValidRoles.ADMIN)
  @Get('all')
  async getUsers() {
    return this.userService.findAllUsers();
  }

  @Get()
  async getUser(@GetUser() user: User) {
    return this.userService.findOne(user.id);
  }

  @Patch()
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ) {
    return this.userService.updateUser(user.id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@GetUser() user: User) {
    return this.userService.deleteUser(user.id);
  }
}
