import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { CreateFileDto } from './dto/create-file.dto';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) {}

  async create(createFileDto: CreateFileDto, file: Express.Multer.File) {
    const filename = await this.minioService.uploadFile(file, 'uploads');

    return this.prisma.document.create({
      data: {
        registrationId: createFileDto.userId, // Use userId as registrationId for now
        type: 'OTHER', // Default document type
        s3Key: filename,
        url: this.minioService.getFileUrl(filename),
        uploadedAt: new Date(),
      },
    });
  }

  async findAll() {
    return this.prisma.document.findMany({
      include: {
        registration: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const file = await this.prisma.document.findUnique({
      where: { id },
      include: {
        registration: {
          include: {
            user: {
              select: {
                id: true,
                phone: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  async remove(id: string) {
    const file = await this.findOne(id);
    
    // Delete from MinIO
    await this.minioService.deleteFile(file.s3Key);
    
    // Delete from database
    return this.prisma.document.delete({
      where: { id },
    });
  }
}
