import { UpdateAlbumsOrderRequest } from '@lounge/types';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsUUID, ValidateNested } from 'class-validator';

class AlbumOrderItem {
  @IsUUID(4, { message: 'Album ID must be a valid UUID' })
  id: string;

  @IsNumber({}, { message: 'Display order must be a number' })
  displayOrder: number;
}

export class UpdateAlbumsOrderDto implements UpdateAlbumsOrderRequest {
  @IsArray({ message: 'Albums array is expected' })
  @ArrayMinSize(1, { message: 'Array must contain at least one album' })
  @ValidateNested({ each: true })
  @Type(() => AlbumOrderItem)
  albums: AlbumOrderItem[];
}
