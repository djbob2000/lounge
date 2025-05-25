import { UpdatePhotoRequest } from '@lounge/types';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePhotoDto implements UpdatePhotoRequest {
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isSliderImage?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
