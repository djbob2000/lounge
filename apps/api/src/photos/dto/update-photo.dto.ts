import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { UpdatePhotoRequest } from '@lounge/types';

export class UpdatePhotoDto implements UpdatePhotoRequest {
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isSliderImage?: boolean;
}
