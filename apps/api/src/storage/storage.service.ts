import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as B2 from 'backblaze-b2';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

import { UploadFileResponseDto } from './dto/upload.dto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private b2Client: B2;
  private bucketId: string;
  private bucketName: string;
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly thumbnailSizes = {
    small: { width: 320, height: 320 },
    medium: { width: 640, height: 640 },
    large: { width: 1280, height: 1280 },
  };
  private readonly enableWebP = true;
  private readonly enableProgressive = true;

  constructor(private readonly configService: ConfigService) {
    this.initializeB2();
  }

  /**
   * Initialize the B2 client
   */
  private async initializeB2(): Promise<void> {
    try {
      const applicationKeyId = this.configService.get<string>('B2_APPLICATION_KEY_ID');
      const applicationKey = this.configService.get<string>('B2_APPLICATION_KEY');
      const bucketId = this.configService.get<string>('B2_BUCKET_ID');
      const bucketName = this.configService.get<string>('B2_BUCKET_NAME');

      if (!applicationKeyId || !applicationKey || !bucketId || !bucketName) {
        this.logger.error(
          'Missing B2 configuration: One or more B2 environment variables are not set.',
        );
        // Optionally, throw an error to prevent further execution if B2 is critical
        throw new InternalServerErrorException('B2 configuration is incomplete.');
      }

      // Now we are sure these values are strings
      this.bucketId = bucketId;
      this.bucketName = bucketName;

      this.b2Client = new B2({
        applicationKeyId: applicationKeyId,
        applicationKey: applicationKey,
      });

      await this.b2Client.authorize();
      this.logger.log('B2 client initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize B2 client: ${error.message}`);
    }
  }

  /**
   * Upload file to B2 with optimization
   */
  async uploadFile(file: Express.Multer.File): Promise<UploadFileResponseDto> {
    try {
      // Check file type and size
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('Invalid file type. Allowed types: JPEG, PNG, WebP, GIF');
      }

      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`,
        );
      }

      // Generate unique file name
      const fileId = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${fileId}${fileExtension}`;
      const metadata = await this.getImageMetadata(file.buffer);

      // Optimize original image
      const optimizedBuffer = await this.optimizeImage(file.buffer, file.mimetype);

      // Upload optimized original file
      const originalFileName = `photos/original/${fileName}`;
      const originalFileUrl = await this.uploadToB2(
        optimizedBuffer,
        originalFileName,
        file.mimetype,
      );

      // Generate and upload thumbnail
      const thumbnailBuffer = await this.generateThumbnail(optimizedBuffer);
      const thumbnailFileName = `photos/thumbnails/${fileId}_thumbnail${fileExtension}`;
      const thumbnailUrl = await this.uploadToB2(thumbnailBuffer, thumbnailFileName, file.mimetype);

      // Generate WebP versions if enabled
      const webpUrls = await this.generateWebPVersions(optimizedBuffer, fileId);

      return {
        id: fileId,
        filename: file.originalname,
        originalUrl: originalFileUrl,
        thumbnailUrl,
        width: metadata.width,
        height: metadata.height,
        webpUrls,
      };
    } catch (error) {
      this.logger.error(`Upload file error: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  /**
   * Delete file from B2
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      // If client is not initialized, re-initialize
      if (!this.b2Client) {
        await this.initializeB2();
      }

      // Get file information
      const { data: fileList } = await this.b2Client.listFileNames({
        bucketId: this.bucketId,
        prefix: fileId,
        maxFileCount: 10,
      });

      // Delete all files matching the ID
      const deletePromises = fileList.files.map(async (file) => {
        try {
          await this.b2Client.deleteFileVersion({
            fileName: file.fileName,
            fileId: file.fileId,
          });
          this.logger.log(`Deleted file: ${file.fileName}`);
          return true;
        } catch (error) {
          this.logger.error(`Failed to delete file ${file.fileName}: ${error.message}`);
          return false;
        }
      });

      const results = await Promise.all(deletePromises);
      return results.every(Boolean);
    } catch (error) {
      this.logger.error(`Delete file error: ${error.message}`);
      return false;
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(fileName: string): string {
    const downloadUrl = this.configService.get<string>('B2_DOWNLOAD_URL');
    if (!downloadUrl) {
      throw new InternalServerErrorException('B2 download URL not configured');
    }
    return `${downloadUrl}/file/${this.bucketName}/${fileName}`;
  }

  /**
   * Upload buffer to B2
   */
  private async uploadToB2(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (!this.b2Client) {
          this.logger.log(
            `B2 client not initialized (attempt ${attempt} for ${fileName}), re-initializing...`,
          );
          await this.initializeB2();
          if (!this.b2Client) {
            // Check again after attempt to initialize
            throw new InternalServerErrorException('B2 client could not be initialized for upload');
          }
        }

        this.logger.log(`Attempt ${attempt}/${MAX_RETRIES} to upload ${fileName}`);

        const { data: authData } = await this.b2Client.getUploadUrl({
          bucketId: this.bucketId,
        });

        await this.b2Client.uploadFile({
          uploadUrl: authData.uploadUrl,
          uploadAuthToken: authData.authorizationToken,
          fileName,
          contentType,
          data: buffer,
        });

        this.logger.log(`Successfully uploaded ${fileName} on attempt ${attempt}`);
        return this.getFileUrl(fileName); // Success
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Attempt ${attempt}/${MAX_RETRIES} failed for ${fileName}: ${error.message}`,
        );

        // Check if it's an Axios error from backblaze-b2 and if it's a retryable status
        // B2 library uses axios, so error.response.status should be available for HTTP errors
        const statusCode = error.response?.status || error.status;
        const retryableStatuses = [500, 502, 503, 504]; // Common transient server errors

        if (retryableStatuses.includes(statusCode) && attempt < MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * attempt; // Exponential backoff
          this.logger.log(
            `Retryable error (status ${statusCode}). Retrying in ${delay / 1000}s...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          // continue; // Loop will continue to the next iteration
        } else {
          this.logger.error(
            `Upload to B2 failed for ${fileName} after ${attempt} attempts. Last error: ${error.message}`,
            error.stack,
          );
          throw new InternalServerErrorException(
            `Failed to upload to B2 after ${attempt} attempts: ${error.message}`,
          );
        }
      }
    }

    // This part should ideally not be reached if MAX_RETRIES > 0,
    // as the loop's else block should throw.
    // However, it's a fallback for an exhaustive failure.
    this.logger.error(
      `Upload to B2 failed definitively for ${fileName}. Last error: ${lastError?.message}`,
      lastError?.stack,
    );
    throw new InternalServerErrorException(
      `Failed to upload to B2 definitively: ${lastError?.message}`,
    );
  }

  /**
   * Get image metadata
   */
  private async getImageMetadata(buffer: Buffer): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      this.logger.error(`Image metadata error: ${error.message}`);
      return { width: 0, height: 0 };
    }
  }

  /**
   * Optimize image with progressive JPEG and WebP
   */
  private async optimizeImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
    try {
      if (mimetype === 'image/jpeg' && this.enableProgressive) {
        return await sharp(buffer)
          .jpeg({
            quality: 85,
            progressive: true,
            mozjpeg: true,
          })
          .toBuffer();
      }

      if (mimetype === 'image/png') {
        return await sharp(buffer)
          .png({
            quality: 85,
            compressionLevel: 9,
          })
          .toBuffer();
      }

      return buffer;
    } catch (error) {
      this.logger.error(`Image optimization error: ${error.message}`);
      return buffer; // Return original if optimization fails
    }
  }

  /**
   * Generate WebP versions
   */
  private async generateWebPVersions(
    buffer: Buffer,
    fileId: string,
  ): Promise<{ [key: string]: string } | null> {
    if (!this.enableWebP) {
      return null;
    }

    try {
      const webpUrls: { [key: string]: string } = {};

      // Generate WebP for original size
      const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

      const webpFileName = `photos/webp/${fileId}.webp`;
      webpUrls.original = await this.uploadToB2(webpBuffer, webpFileName, 'image/webp');

      // Generate WebP thumbnails
      for (const [size, dimensions] of Object.entries(this.thumbnailSizes)) {
        const webpThumbnailBuffer = await sharp(buffer)
          .resize(dimensions.width, dimensions.height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 75 })
          .toBuffer();

        const webpThumbnailFileName = `photos/webp/${fileId}_${size}.webp`;
        webpUrls[`thumbnail_${size}`] = await this.uploadToB2(
          webpThumbnailBuffer,
          webpThumbnailFileName,
          'image/webp',
        );
      }

      return webpUrls;
    } catch (error) {
      this.logger.error(`WebP generation error: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate thumbnail
   */
  private async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    try {
      const { width, height } = this.thumbnailSizes.medium;
      return await sharp(buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 80,
          progressive: this.enableProgressive,
        })
        .toBuffer();
    } catch (error) {
      this.logger.error(`Thumbnail generation error: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate thumbnail');
    }
  }

  /**
   * Generate multiple thumbnails of different sizes
   */
  async generateMultipleThumbnails(buffer: Buffer): Promise<{ [key: string]: Buffer }> {
    const thumbnails: { [key: string]: Buffer } = {};

    try {
      for (const [size, dimensions] of Object.entries(this.thumbnailSizes)) {
        thumbnails[size] = await sharp(buffer)
          .resize(dimensions.width, dimensions.height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toBuffer();
      }
      return thumbnails;
    } catch (error) {
      this.logger.error(`Multiple thumbnails generation error: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate thumbnails');
    }
  }

  /**
   * Save temporary file
   */
  async saveTempFile(buffer: Buffer): Promise<string> {
    const tempDir = path.join(os.tmpdir(), 'lounge-uploads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `${uuidv4()}.tmp`);
    fs.writeFileSync(tempFilePath, buffer);
    return tempFilePath;
  }

  /**
   * Delete temporary file
   */
  deleteTempFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
