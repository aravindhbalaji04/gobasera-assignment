import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessWebhookDto } from './dto/process-webhook.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a Razorpay order for payment' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: { uid: string; id: string; role: UserRole }
  ) {
    return this.paymentsService.createOrder(createOrderDto, user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: { uid: string; id: string; role: UserRole }
  ) {
    return this.paymentsService.create(createPaymentDto, user.id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Process Razorpay webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  processWebhook(@Body() processWebhookDto: ProcessWebhookDto) {
    return this.paymentsService.processWebhook(processWebhookDto);
  }

  @Get('registration/:registrationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get payments for a registration' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findByRegistration(
    @Param('registrationId') registrationId: string,
    @CurrentUser() user: { uid: string; id: string; role: UserRole }
  ) {
    return this.paymentsService.findByRegistration(registrationId, user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Get a specific payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { uid: string; id: string; role: UserRole }
  ) {
    return this.paymentsService.findOne(id, user.id);
  }
}
