import { UpdateCategoryRequest } from '@lounge/types';
import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateCategoryDto implements UpdateCategoryRequest {
  @IsOptional()
  @IsString({ message: 'Category name must be a string' })
  @MinLength(2, {
    message: 'Category name must contain at least 2 characters',
  })
  @MaxLength(100, {
    message: 'Category name cannot exceed 100 characters',
  })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  @MinLength(2, { message: 'Slug must contain at least 2 characters' })
  @MaxLength(100, { message: 'Slug cannot exceed 100 characters' })
  slug?: string;

  @IsOptional()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean({ message: 'showInMenu must be a boolean value' })
  showInMenu?: boolean;
}
