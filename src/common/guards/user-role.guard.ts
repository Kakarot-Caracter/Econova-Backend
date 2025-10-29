import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'generated/prisma';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      ctx.getHandler(),
    );

    if (!validRoles) return true;

    const req = ctx.switchToHttp().getRequest();

    const user = req.user as User;

    if (!user) throw new InternalServerErrorException('User not foud');

    if (validRoles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException(
      'User ' + user.name + ' need a valid role: ' + validRoles,
    );
  }
}
