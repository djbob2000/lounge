import { UpdatePhotosOrderRequest } from '@lounge/types';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber, IsUUID, ValidateNested } from 'class-validator';

class PhotoOrderItem {
  @IsUUID(4, { message: 'Photo ID must be a valid UUID' })
  id: string;

  @IsNumber({}, { message: 'Display order must be a number' })
  displayOrder: number;
}

export class UpdatePhotosOrderDto implements UpdatePhotosOrderRequest {
  @IsArray({ message: 'Photos array is expected' })
  @ArrayNotEmpty({ message: 'Array must contain at least one photo' })
  @ValidateNested({ each: true })
  @Type(() => PhotoOrderItem)
  photos: PhotoOrderItem[];
}
