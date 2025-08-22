import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { CreatePresignedUrlDto, DocumentType } from './dto/create-presigned-url.dto';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class UploadsService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService
  ) {}

  async createPresignedUrl(createPresignedUrlDto: CreatePresignedUrlDto, userId: string) {
    const { fileName, fileType, documentType, registrationId } = createPresignedUrlDto;

    // Validate file type
    if (!this.isValidFileType(fileType)) {
      throw new BadRequestException('Invalid file type. Only PDF, JPG, PNG, and DOC files are allowed.');
    }

    // Generate unique S3 key
    const fileExtension = fileName.split('.').pop();
    const s3Key = `uploads/${userId}/${registrationId || 'temp'}/${documentType}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Generate presigned URL for PUT operation
    const presignedUrl = await this.minioService.generatePresignedUrl(s3Key, 'PUT', fileType);

    // For now, return the presigned URL without creating a document record
    // This will be created when we have proper registration flow
    return {
      presignedUrl,
      s3Key,
      expiresIn: 3600 // 1 hour
    };
  }

  async markDocumentAsUploaded(documentId: string) {
    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        uploadedAt: new Date()
      }
    });
  }

  async getDocument(documentId: string) {
    return this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        registration: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                role: true
              }
            }
          }
        }
      }
    });
  }

  async deleteDocument(documentId: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        registration: {
          select: { userId: true }
        }
      }
    });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    if (document.registration.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    // Delete from MinIO
    await this.minioService.deleteFile(document.s3Key);

    // Delete from database
    return this.prisma.document.delete({
      where: { id: documentId }
    });
  }

  private isValidFileType(fileType: string): boolean {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return allowedTypes.includes(fileType);
  }
}
