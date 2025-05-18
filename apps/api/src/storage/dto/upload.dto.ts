import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';

/**
 * DTO для завантаження файлу
 */
export class UploadFileDto {
  /**
   * ID альбому, до якого належить фото (необов'язково)
   */
  @IsUUID()
  @IsOptional()
  readonly albumId?: string;

  /**
   * Чи відображати фото на слайдері (необов'язково)
   */
  @IsBoolean()
  @IsOptional()
  readonly isSliderImage?: boolean;

  /**
   * Порядок відображення фото (необов'язково)
   */
  @IsNumber()
  @IsOptional()
  readonly displayOrder?: number;
}

/**
 * DTO з результатом завантаження файлу
 */
export class UploadFileResponseDto {
  /**
   * ID завантаженого файлу
   */
  id: string;

  /**
   * Оригінальна назва файлу
   */
  filename: string;

  /**
   * URL до оригінального зображення
   */
  originalUrl: string;

  /**
   * URL до мініатюри зображення
   */
  thumbnailUrl: string;

  /**
   * Ширина зображення
   */
  width: number;

  /**
   * Висота зображення
   */
  height: number;

  /**
   * ID альбому, до якого належить фото (якщо вказано)
   */
  albumId?: string;
}
