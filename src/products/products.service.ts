import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

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

    try {
      const { secure_url } = await this.cloudinary.uploadFile(file);

      const product = await this.prisma.product.create({
        data: {
          ...createProductDto,
          slug,
          image: secure_url,
        },
      });

      return product;
    } catch (error) {
      this.prisma.prismaHandlerError(error);
    }
  }

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file: Express.Multer.File,
  ) {
    const product = await this.findOne(id);

    if (file) {
      // Check if product has an existing image
      if (product.image) {
        // Extract public ID safely
        const publicId = product.image.split('/').pop()?.split('.')[0];
        if (publicId) {
          await this.cloudinary.deleteFile(publicId);
        }
      }
    }

    // Upload new image
    const { secure_url } = await this.cloudinary.uploadFile(file);

    const dataToUpdate = { ...updateProductDto, image: secure_url };

    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: dataToUpdate,
      });

      return updatedProduct;
    } catch (error) {
      this.prisma.prismaHandlerError(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    if (product.image) {
      const publicId = product.image.split('/').pop()?.split('.')[0];
      if (publicId) {
        await this.cloudinary.deleteFile(publicId);
      }
    }

    await this.prisma.product.delete({ where: { id } });

    return { message: `Product with id ${id} deleted` };
  }
}
