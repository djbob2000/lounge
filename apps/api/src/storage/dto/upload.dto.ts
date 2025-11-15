import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';

/**
 * DTO for file upload
 */
export class UploadFileDto {
  /**
   * Album ID to which the photo belongs (optional)
   */
  @IsUUID()
  @IsOptional()
  readonly albumId?: string;

  /**
   * Whether to display photo in slider (optional)
   */
  @IsBoolean()
  @IsOptional()
  readonly isSliderImage?: boolean;

  /**
   * Photo display order (optional)
   */
  @IsNumber()
  @IsOptional()
  readonly displayOrder?: number;
}

/**
 * DTO with file upload result
 */
export class UploadFileResponseDto {
  /**
   * Uploaded file ID
   */
  id: string;

  /**
   * Original filename
   */
  filename: string;

  /**
   * URL to original image
   */
  originalUrl: string;

  /**
   * URL to thumbnail image
   */
  thumbnailUrl: string;

  /**
   * Image width
   */
  width: number;

  /**
   * Image height
   */
  height: number;

  /**
   * Album ID to which the photo belongs (if specified)
   */
  albumId?: string;

  /**
   * URLs to WebP versions of the image
   */
  webpUrls?: { [key: string]: string } | null;
}
