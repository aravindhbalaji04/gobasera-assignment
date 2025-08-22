import { Controller, Get, Post, Body, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @Body() createFileDto: CreateFileDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    // Add user ID to the DTO
    createFileDto.userId = user.id;
    return this.filesService.create(createFileDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPPORT, UserRole.COMMITTEE)
  @ApiOperation({ summary: 'Delete file by ID (Support/Committee only)' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  remove(@Param('id') id: string) {
    return this.filesService.remove(id);
  }
}
