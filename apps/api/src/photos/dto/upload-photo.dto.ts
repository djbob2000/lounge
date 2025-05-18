import { UploadPhotoRequest } from '@lounge/types';
import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class UploadPhotoDto implements UploadPhotoRequest {
  @IsUUID()
  albumId: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isSliderImage?: boolean;
}
