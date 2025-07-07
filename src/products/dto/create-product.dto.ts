import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
} from 'class-validator';

enum Category {
  FASHION_ACCESSORIES = 'FASHION_ACCESSORIES',
  ELECTRONICS_TECH = 'ELECTRONICS_TECH',
  HOME_GARDEN = 'HOME_GARDEN',
  HEALTH_BEAUTY = 'HEALTH_BEAUTY',
  SPORTS_OUTDOORS = 'SPORTS_OUTDOORS',
  FOOD_BEVERAGES = 'FOOD_BEVERAGES',
  BABY_TOYS = 'BABY_TOYS',
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  sku: string;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  price: number;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  stock: number;

  @IsEnum(Category)
  @IsNotEmpty()
  category: Category;
}
