import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // Asegúrate de la ruta correcta

@Module({
  imports: [CloudinaryModule], // ¡Importa CloudinaryModule aquí!
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
