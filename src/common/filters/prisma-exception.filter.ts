import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from 'generated/prisma';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;
    let message = 'Error en la base de datos';

    switch (exception.code) {
      case 'P2002': {
        // Unique constraint failed
        const fields = Array.isArray(exception.meta?.target)
          ? exception.meta.target.join(', ')
          : 'campo desconocido';
        message =
          fields === 'slug'
            ? 'Producto ya creado.'
            : `El campo ${fields} ya está en uso.`;
        break;
      }

      case 'P2025': {
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Registro no encontrado.';
        break;
      }

      case 'P2003': {
        // Foreign key constraint failed
        status = HttpStatus.CONFLICT;
        message =
          'No se puede eliminar o actualizar debido a una relación existente.';
        break;
      }

      default: {
        // Cualquier otro error conocido de Prisma
        status = HttpStatus.BAD_REQUEST;
        message = `Error Prisma (${exception.code}): ${exception.message}`;
        break;
      }
    }

    // Siempre devolvemos información clara y consistente
    response.status(status).json({
      statusCode: status,
      message,
      code: exception.code,
      meta: exception.meta ?? null, // útil para saber qué campo falló
    });
  }
}
