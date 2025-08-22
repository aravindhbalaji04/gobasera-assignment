import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  @ApiOperation({ summary: 'Generate presigned URL for document upload' })
  @ApiResponse({ status: 201, description: 'Presigned URL generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type' })
  createPresignedUrl(
    @Body() createPresignedUrlDto: CreatePresignedUrlDto,
    @CurrentUser() user: { uid: string; id: string; role: UserRole }
  ) {
    return this.uploadsService.createPresignedUrl(createPresignedUrlDto, user.id);
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Get document details' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  getDocument(
    @Param('id') id: string,
    @CurrentUser() user: { uid: string; id: string; role: UserRole }
  ) {
    return this.uploadsService.getDocument(id);
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  deleteDocument(
    @Param('id') id: string,
    @CurrentUser() user: { uid: string; id: string; role: UserRole }
  ) {
    return this.uploadsService.deleteDocument(id, user.id);
  }
}
