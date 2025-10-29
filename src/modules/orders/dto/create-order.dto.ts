import { Type } from 'class-transformer';
import {
  IsInt,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
  IsString,
} from 'class-validator';

class OrderItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  total: number;
}

export class CreateOrderDto {
  @IsInt()
  userId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
