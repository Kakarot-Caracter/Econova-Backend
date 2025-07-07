import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async prismaHandlerError(error: unknown): Promise<never> {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new BadRequestException('This email is already registered');
        case 'P2025':
          throw new BadRequestException('Record not found');
        default:
          throw new InternalServerErrorException('Database error');
      }
    }

    throw new InternalServerErrorException('Unexpected error');
  }
}
