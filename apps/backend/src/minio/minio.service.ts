import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: parseInt(this.configService.get('MINIO_PORT')),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });

    this.bucketName = this.configService.get('MINIO_BUCKET');
  }

  async onModuleInit() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName);
        console.log(`✅ MinIO bucket '${this.bucketName}' created successfully`);
      } else {
        console.log(`✅ MinIO bucket '${this.bucketName}' already exists`);
      }
    } catch (error) {
      console.error('❌ Error initializing MinIO:', error);
    }
  }

  async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    const filename = `${path}/${Date.now()}-${file.originalname}`;
    
    await this.minioClient.putObject(
      this.bucketName,
      filename,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype }
    );

    return filename;
  }

  async deleteFile(filename: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, filename);
  }

  getFileUrl(filename: string): string {
    return `${this.configService.get('MINIO_ENDPOINT')}:${this.configService.get('MINIO_PORT')}/${this.bucketName}/${filename}`;
  }

  getClient(): Minio.Client {
    return this.minioClient;
  }

  async generatePresignedUrl(key: string, method: 'GET' | 'PUT' | 'POST', contentType?: string): Promise<string> {
    const expiresIn = 3600; // 1 hour
    
    if (method === 'PUT') {
      return this.minioClient.presignedPutObject(this.bucketName, key, expiresIn);
    } else if (method === 'GET') {
      return this.minioClient.presignedGetObject(this.bucketName, key, expiresIn);
    } else {
      throw new Error(`Unsupported method: ${method}`);
    }
  }
}
