import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { UploadPhotoRequest } from '@lounge/types';

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
