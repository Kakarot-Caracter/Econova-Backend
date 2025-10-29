import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Response } from 'express';

import * as bcrypt from 'bcrypt';

//Services
import { PrismaService } from 'src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';

//Dtos e interfaces
import { Jwtpayload } from './interfaces/jwt.payload';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}
  async register(createUserDto: CreateUserDto, res: Response) {
    const user = await this.userService.createUser(createUserDto);

    const token = this.signToken({ id: user.id });

    this.setCookie(res, token);

    return { id: user.id, email: user.email, name: user.name };
  }

  async login(loginAuthDto: LoginAuthDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginAuthDto.email },
    });

    if (!user) throw new BadRequestException('Usuario no registrado.');

    const valid = await bcrypt.compare(loginAuthDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Contraseña inválida.');

    const token = this.signToken({ id: user.id });
    this.setCookie(res, token);

    return { id: user.id, email: user.email, name: user.name };
  }

  logout(res: Response): void {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
  }

  private signToken(payload: Jwtpayload): string {
    return this.jwtService.sign(payload);
  }

  private setCookie(res: Response, token: string) {
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });
  }
}
