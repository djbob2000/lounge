import { UpdateAlbumRequest } from '@lounge/types';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateAlbumDto implements UpdateAlbumRequest {
  @IsOptional()
  @IsString({ message: 'Album name must be a string' })
  @MinLength(2, {
    message: 'Album name must be at least 2 characters',
  })
  @MaxLength(100, {
    message: 'Album name cannot exceed 100 characters',
  })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'Slug can only contain lowercase Latin letters, numbers, and hyphens',
  })
  @MinLength(2, { message: 'Slug must be at least 2 characters' })
  @MaxLength(100, { message: 'Slug cannot exceed 100 characters' })
  slug?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @IsOptional()
  @IsUUID(4, { message: 'Category ID must be a valid UUID' })
  categoryId?: string;

  @IsOptional()
  displayOrder?: number;

  @IsOptional()
  @IsString({ message: 'Cover image URL must be a string' })
  coverImageUrl?: string;

  @IsOptional()
  @IsBoolean({ message: 'isHidden must be a boolean value' })
  isHidden?: boolean;
}
