import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SocietiesService } from './societies.service';
import { CreateSocietyDto } from './dto/create-society.dto';
import { UpdateSocietyDto } from './dto/update-society.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Societies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('societies')
export class SocietiesController {
  constructor(private readonly societiesService: SocietiesService) {}

  @Post()
  @Roles(UserRole.SUPPORT, UserRole.COMMITTEE)
  @ApiOperation({ summary: 'Create a new society (Support/Committee only)' })
  @ApiResponse({ status: 201, description: 'Society created successfully' })
  create(@Body() createSocietyDto: CreateSocietyDto, @CurrentUser() user: any) {
    return this.societiesService.create(createSocietyDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all societies' })
  @ApiResponse({ status: 200, description: 'Societies retrieved successfully' })
  findAll() {
    return this.societiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get society by ID' })
  @ApiResponse({ status: 200, description: 'Society retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.societiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPPORT, UserRole.COMMITTEE)
  @ApiOperation({ summary: 'Update society by ID (Support/Committee only)' })
  @ApiResponse({ status: 200, description: 'Society updated successfully' })
  update(@Param('id') id: string, @Body() updateSocietyDto: UpdateSocietyDto) {
    return this.societiesService.update(id, updateSocietyDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPPORT)
  @ApiOperation({ summary: 'Delete society by ID (Support only)' })
  @ApiResponse({ status: 200, description: 'Society deleted successfully' })
  remove(@Param('id') id: string) {
    return this.societiesService.remove(id);
  }
}
