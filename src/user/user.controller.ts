import { Controller, Get, Patch, Body, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'generated/prisma';

@Auth(ValidRoles.USER, ValidRoles.ADMIN)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth(ValidRoles.ADMIN)
  @Get('all')
  findAll() {
    return this.userService.findAll();
  }

  @Get()
  findOne(@GetUser() user: User) {
    return this.userService.findOne(user.id);
  }

  // <-- quitar :id para aceptar PATCH /users
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto, @GetUser() user: User) {
    return this.userService.update(user.id, updateUserDto);
  }

  @Delete(':id')
  remove(@GetUser() user: User) {
    return this.userService.remove(user.id);
  }
}
