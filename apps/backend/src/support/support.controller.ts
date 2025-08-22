import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApproveRegistrationDto } from './dto/approve-registration.dto';
import { RejectRegistrationDto } from './dto/reject-registration.dto';
import { RegistrationStatus } from '@prisma/client';
import { FunnelAnalytics } from './support.service';

@ApiTags('support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Roles('SUPPORT')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('registrations')
  @ApiOperation({ summary: 'List registrations with pagination and filtering' })
  @ApiQuery({ name: 'status', required: false, enum: RegistrationStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Registrations retrieved successfully' })
  async getRegistrations(
    @Query('status') status?: RegistrationStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.supportService.getRegistrations({ status, page, limit, search });
  }

  @Post('registrations/:id/approve')
  @ApiOperation({ summary: 'Approve a registration' })
  @ApiResponse({ status: 200, description: 'Registration approved successfully' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async approveRegistration(
    @Param('id') id: string,
    @Body() approveDto: ApproveRegistrationDto,
    @CurrentUser() user: { uid: string; id: string; role: string },
  ) {
    return this.supportService.approveRegistration(id, approveDto, user.id);
  }

  @Post('registrations/:id/reject')
  @ApiOperation({ summary: 'Reject a registration with reason' })
  @ApiResponse({ status: 200, description: 'Registration rejected successfully' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  async rejectRegistration(
    @Param('id') id: string,
    @Body() rejectDto: RejectRegistrationDto,
    @CurrentUser() user: { uid: string; id: string; role: string },
  ) {
    return this.supportService.rejectRegistration(id, rejectDto, user.id);
  }

  @Get('analytics/funnel')
  @ApiOperation({ summary: 'Get registration funnel analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getFunnelAnalytics() {
    return this.supportService.getFunnelAnalytics();
  }
}
