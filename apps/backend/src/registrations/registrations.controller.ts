import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('registrations')
@Controller('registrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a new draft registration' })
  @ApiResponse({ status: 201, description: 'Registration created successfully' })
  @ApiResponse({ status: 403, description: 'User already has an active registration' })
  create(
    @Body() createRegistrationDto: CreateRegistrationDto,
    @CurrentUser() user: { uid: string; id: string; role: UserRole }
  ) {
    return this.registrationsService.create(createRegistrationDto, user.id);
  }

  @Get()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get all registrations for the current user' })
  @ApiResponse({ status: 200, description: 'Registrations retrieved successfully' })
  findAll(@CurrentUser() user: { uid: string; id: string; role: UserRole }) {
    return this.registrationsService.findByUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific registration by ID' })
  @ApiResponse({ status: 200, description: 'Registration retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { uid: string; id: string; role: UserRole }
  ) {
    return this.registrationsService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update registration step payloads' })
  @ApiResponse({ status: 200, description: 'Registration updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  update(
    @Param('id') id: string,
    @Body() updateRegistrationDto: UpdateRegistrationDto,
    @CurrentUser() user: { uid: string; id: string; role: UserRole }
  ) {
    return this.registrationsService.update(id, updateRegistrationDto, user.id, user.role);
  }
}
