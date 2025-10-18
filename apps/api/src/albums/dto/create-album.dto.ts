import { CreateAlbumRequest } from '@lounge/types';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAlbumDto implements CreateAlbumRequest {
  @IsNotEmpty({ message: 'Album name cannot be empty' })
  @IsString({ message: 'Album name must be a string' })
  @MinLength(2, {
    message: 'Album name must contain at least 2 characters',
  })
  @MaxLength(100, {
    message: 'Album name cannot exceed 100 characters',
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase Latin letters, numbers, and hyphens',
  })
  @MinLength(2, { message: 'Slug must contain at least 2 characters' })
  @MaxLength(100, { message: 'Slug cannot exceed 100 characters' })
  slug?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @IsNotEmpty({ message: 'Category ID is required' })
  @IsUUID(4, { message: 'Category ID must be a valid UUID' })
  categoryId: string;

  @IsNotEmpty({ message: 'Display order is required' })
  @IsNumber({}, { message: 'Display order must be a number' })
  displayOrder: number;

  @IsOptional()
  @IsBoolean({ message: 'isHidden must be a boolean value' })
  isHidden?: boolean;
}
