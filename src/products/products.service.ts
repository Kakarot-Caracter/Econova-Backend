// products.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { prismaHandlerError } from 'src/prisma/prisma.errors';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(createProductDto: CreateProductDto, file: Express.Multer.File) {
    const { name } = createProductDto;
    const slug = name.toLowerCase().replace(/ /g, '-');

    let uploadResult;

    try {
      uploadResult = await this.cloudinary.uploadFile(file);
      return await this.prisma.product.create({
        data: {
          ...createProductDto,
          slug,
          image: uploadResult.secure_url,
          imageId: uploadResult.public_id,
        },
      });
    } catch (error) {
      if (uploadResult) {
        await this.cloudinary.deleteFile(uploadResult.public_id);
      }
      throw prismaHandlerError(error);
    }
  }

  async findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ) {
    const product = await this.findOne(id);

    let uploadResult;

    if (file) {
      if (product.imageId) {
        await this.cloudinary.deleteFile(product.imageId);
      }
      uploadResult = await this.cloudinary.uploadFile(file);
    }

    const dataToUpdate: Partial<
      UpdateProductDto & { image?: string; imageId?: string }
    > = {
      ...updateProductDto,
    };

    if (uploadResult) {
      dataToUpdate.image = uploadResult.secure_url;
      dataToUpdate.imageId = uploadResult.public_id;
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error) {
      if (uploadResult) {
        await this.cloudinary.deleteFile(uploadResult.public_id);
      }
      throw prismaHandlerError(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    if (product.imageId) {
      await this.cloudinary.deleteFile(product.imageId);
    }
    await this.prisma.product.delete({ where: { id } });
    return { message: `Product with id ${id} deleted` };
  }
}
