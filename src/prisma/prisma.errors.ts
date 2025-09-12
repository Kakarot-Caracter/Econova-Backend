import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

export const prismaHandlerError = (error: unknown): never => {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new BadRequestException('Object Duplicated.');
      case 'P2025':
        throw new BadRequestException('Record not found');
      default:
        throw new InternalServerErrorException('Database error');
    }
  }

  throw new InternalServerErrorException('Unexpected error');
};
