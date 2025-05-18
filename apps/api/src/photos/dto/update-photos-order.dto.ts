import { UpdatePhotosOrderRequest } from '@lounge/types';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class PhotoOrderItem {
  @IsUUID()
  id: string;

  @IsNumber()
  displayOrder: number;
}

export class UpdatePhotosOrderDto implements UpdatePhotosOrderRequest {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PhotoOrderItem)
  photos: PhotoOrderItem[];
}
