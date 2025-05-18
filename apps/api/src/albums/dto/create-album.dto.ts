import { CreateAlbumRequest } from '@lounge/types';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAlbumDto implements CreateAlbumRequest {
  @IsNotEmpty({ message: 'Назва альбому не може бути порожньою' })
  @IsString({ message: 'Назва альбому повинна бути рядком' })
  @MinLength(2, {
    message: 'Назва альбому повинна містити мінімум 2 символи',
  })
  @MaxLength(100, {
    message: 'Назва альбому не може перевищувати 100 символів',
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'Slug повинен бути рядком' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug може містити лише малі літери латиниці, цифри та дефіс',
  })
  @MinLength(2, { message: 'Slug повинен містити мінімум 2 символи' })
  @MaxLength(100, { message: 'Slug не може перевищувати 100 символів' })
  slug?: string;

  @IsOptional()
  @IsString({ message: 'Опис повинен бути рядком' })
  @MaxLength(1000, { message: 'Опис не може перевищувати 1000 символів' })
  description?: string;

  @IsNotEmpty({ message: "ID категорії є обов'язковим" })
  @IsUUID(4, { message: 'ID категорії повинен бути валідним UUID' })
  categoryId: string;

  @IsOptional()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean({ message: 'isHidden повинен бути булевим значенням' })
  isHidden?: boolean;
}
