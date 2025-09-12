import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Jwtpayload } from '../interfaces/jwt.payload';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.auth_token,
      ]),
    });
  }

  async validate(payload: Jwtpayload) {
    const user = await this.prisma.user.findFirst({
      where: { id: payload.id },
    });

    if (!user) {
      throw new UnauthorizedException('Token valid, but user does not exist.');
    }

    return user;
  }
}
