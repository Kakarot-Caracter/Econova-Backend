import { Module } from '@nestjs/common';

import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  imports: [], // Necesario para ConfigService
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService], // Exporta el servicio
})
export class CloudinaryModule {}
