import { UpdateCategoriesOrderRequest } from '@lounge/types';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class CategoryOrderItem {
  @IsNotEmpty({ message: 'Category ID cannot be empty' })
  @IsString({ message: 'Category ID must be a string' })
  id: string;

  @IsNotEmpty({ message: 'Display order cannot be empty' })
  @IsNumber({}, { message: 'Display order must be a number' })
  displayOrder: number;
}

export class UpdateCategoriesOrderDto implements UpdateCategoriesOrderRequest {
  @IsArray({ message: 'Categories must be an array' })
  @ArrayMinSize(1, { message: 'At least one category must be specified' })
  @ValidateNested({ each: true })
  @Type(() => CategoryOrderItem)
  categories: CategoryOrderItem[];
}
