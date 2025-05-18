import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateAlbumsOrderRequest } from '@lounge/types';

class AlbumOrderItem {
  @IsUUID(4, { message: 'ID альбому повинен бути валідним UUID' })
  id: string;

  @IsNumber({}, { message: 'Порядок відображення повинен бути числом' })
  displayOrder: number;
}

export class UpdateAlbumsOrderDto implements UpdateAlbumsOrderRequest {
  @IsArray({ message: 'Очікується масив альбомів' })
  @ArrayMinSize(1, { message: 'Масив повинен містити хоча б один альбом' })
  @ValidateNested({ each: true })
  @Type(() => AlbumOrderItem)
  albums: AlbumOrderItem[];
}
