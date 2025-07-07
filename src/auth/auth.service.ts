import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth-dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerAuthDto: RegisterAuthDto, res: Response) {
    try {
      const hashedPassword = await bcrypt.hash(registerAuthDto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          ...registerAuthDto,
          email: registerAuthDto.email.toLowerCase(),
          password: hashedPassword,
        },
      });

      const token = this.jwtService.sign({ id: user.id });

      this.setCookie(res, token);

      return {
        success: true,
        message: 'User registered successfully',
      };
    } catch (error: unknown) {
      await this.prisma.prismaHandlerError(error);
    }
  }

  async login(loginAuthDto: LoginAuthDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginAuthDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Email.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginAuthDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Password .');
    }

    const token = this.jwtService.sign({ id: user.id });
    this.setCookie(res, token);

    return {
      success: true,
      message: 'User logged in successfully',
    };
  }

  async logout(res: Response) {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return {
      success: true,
      message: 'User logged out successfully',
    };
  }

  private setCookie(res: Response, token: string) {
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
  }
}
