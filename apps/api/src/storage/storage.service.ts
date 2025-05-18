import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as B2 from 'backblaze-b2';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

import { UploadFileResponseDto } from './dto/upload.dto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private b2Client: any;
  private bucketId: string;
  private bucketName: string;
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly thumbnailSizes = {
    small: { width: 320, height: 320 },
    medium: { width: 640, height: 640 },
    large: { width: 1280, height: 1280 },
  };

  constructor(private readonly configService: ConfigService) {
    this.initializeB2();
  }

  /**
   * Initialize the B2 client
   */
  private async initializeB2() {
    try {
      const applicationKeyId = this.configService.get<string>(
        'B2_APPLICATION_KEY_ID',
      );
      const applicationKey =
        this.configService.get<string>('B2_APPLICATION_KEY');
      this.bucketId = this.configService.get<string>('B2_BUCKET_ID');
      this.bucketName = this.configService.get<string>('B2_BUCKET_NAME');

      if (
        !applicationKeyId ||
        !applicationKey ||
        !this.bucketId ||
        !this.bucketName
      ) {
        this.logger.error('Missing B2 configuration');
        return;
      }

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
   * Upload file to B2
   */
  async uploadFile(file: Express.Multer.File): Promise<UploadFileResponseDto> {
    try {
      // Check file type and size
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Allowed types: JPEG, PNG, WebP, GIF',
        );
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

      // Upload original file
      const originalFileName = `photos/original/${fileName}`;
      const originalFileUrl = await this.uploadToB2(
        file.buffer,
        originalFileName,
        file.mimetype,
      );

      // Generate and upload thumbnail
      const thumbnailBuffer = await this.generateThumbnail(file.buffer);
      const thumbnailFileName = `photos/thumbnails/${fileId}_thumbnail${fileExtension}`;
      const thumbnailUrl = await this.uploadToB2(
        thumbnailBuffer,
        thumbnailFileName,
        file.mimetype,
      );

      return {
        id: fileId,
        filename: file.originalname,
        originalUrl: originalFileUrl,
        thumbnailUrl,
        width: metadata.width,
        height: metadata.height,
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
          this.logger.error(
            `Failed to delete file ${file.fileName}: ${error.message}`,
          );
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
  private async uploadToB2(
    buffer: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    try {
      // If client is not initialized, re-initialize
      if (!this.b2Client) {
        await this.initializeB2();
      }

      // Get upload URL
      const { data: authData } = await this.b2Client.getUploadUrl({
        bucketId: this.bucketId,
      });

      // Upload file
      const { data } = await this.b2Client.uploadFile({
        uploadUrl: authData.uploadUrl,
        uploadAuthToken: authData.authorizationToken,
        fileName,
        contentType,
        data: buffer,
      });

      // Return file URL
      return this.getFileUrl(fileName);
    } catch (error) {
      this.logger.error(`Upload to B2 error: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload to B2');
    }
  }

  /**
   * Get image metadata
   */
  private async getImageMetadata(
    buffer: Buffer,
  ): Promise<{ width: number; height: number }> {
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
        .toBuffer();
    } catch (error) {
      this.logger.error(`Thumbnail generation error: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate thumbnail');
    }
  }

  /**
   * Generate multiple thumbnails of different sizes
   */
  async generateMultipleThumbnails(
    buffer: Buffer,
  ): Promise<{ [key: string]: Buffer }> {
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
      this.logger.error(
        `Multiple thumbnails generation error: ${error.message}`,
      );
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
