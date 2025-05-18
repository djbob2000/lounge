import { UpdateCategoryRequest } from '@lounge/types';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCategoryDto implements UpdateCategoryRequest {
  @IsOptional()
  @IsString({ message: 'Назва категорії повинна бути рядком' })
  @MinLength(2, {
    message: 'Назва категорії повинна містити мінімум 2 символи',
  })
  @MaxLength(100, {
    message: 'Назва категорії не може перевищувати 100 символів',
  })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Slug повинен бути рядком' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug може містити лише малі літери латиниці, цифри та дефіс',
  })
  @MinLength(2, { message: 'Slug повинен містити мінімум 2 символи' })
  @MaxLength(100, { message: 'Slug не може перевищувати 100 символів' })
  slug?: string;

  @IsOptional()
  displayOrder?: number;
}
