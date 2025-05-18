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
  @IsNotEmpty({ message: 'ID категорії не може бути порожнім' })
  @IsString({ message: 'ID категорії повинен бути рядком' })
  id: string;

  @IsNotEmpty({ message: 'Порядок відображення не може бути порожнім' })
  @IsNumber({}, { message: 'Порядок відображення повинен бути числом' })
  displayOrder: number;
}

export class UpdateCategoriesOrderDto implements UpdateCategoriesOrderRequest {
  @IsArray({ message: 'Категорії повинні бути масивом' })
  @ArrayMinSize(1, { message: 'Має бути вказана принаймні одна категорія' })
  @ValidateNested({ each: true })
  @Type(() => CategoryOrderItem)
  categories: CategoryOrderItem[];
}
