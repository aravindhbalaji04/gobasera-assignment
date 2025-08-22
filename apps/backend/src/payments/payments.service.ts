import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationsService } from '../registrations/registrations.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProcessWebhookDto } from './dto/process-webhook.dto';
import { PaymentStatus } from '@prisma/client';
import { RazorpayService } from '../razorpay/razorpay.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private registrationsService: RegistrationsService,
    private razorpayService: RazorpayService
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
    // Verify registration exists and belongs to user
    const registration = await this.prisma.registration.findUnique({
      where: { id: createOrderDto.registrationId }
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    // Check if payment already exists
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        registrationId: createOrderDto.registrationId,
        status: {
          in: ['PENDING', 'COMPLETED']
        }
      }
    });

    if (existingPayment) {
      throw new BadRequestException('Payment already exists for this registration');
    }

    // Create Razorpay order
    const razorpayOrder = await this.razorpayService.createOrder({
      amount: createOrderDto.amount,
      currency: createOrderDto.currency || 'INR',
      receipt: `reg_${createOrderDto.registrationId}`,
      notes: {
        registrationId: createOrderDto.registrationId,
        userId: userId,
        ...(createOrderDto.notes && { notes: createOrderDto.notes })
      }
    });

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        registrationId: createOrderDto.registrationId,
        razorpayOrderId: razorpayOrder.orderId,
        amount: createOrderDto.amount,
        currency: createOrderDto.currency || 'INR',
        status: 'PENDING'
      },
      include: {
        registration: {
          include: {
            society: true
          }
        }
      }
    });

    return {
      orderId: razorpayOrder.orderId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment.id
    };
  }

  async create(createPaymentDto: CreatePaymentDto, userId: string) {
    // Verify registration exists and belongs to user
    const registration = await this.prisma.registration.findUnique({
      where: { id: createPaymentDto.registrationId }
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    // Check if payment already exists
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        registrationId: createPaymentDto.registrationId,
        status: {
          in: ['PENDING', 'COMPLETED']
        }
      }
    });

    if (existingPayment) {
      throw new BadRequestException('Payment already exists for this registration');
    }

    return this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        status: 'PENDING',
        currency: createPaymentDto.currency || 'INR'
      },
      include: {
        registration: {
          include: {
            society: true
          }
        }
      }
    });
  }

  async processWebhook(processWebhookDto: ProcessWebhookDto) {
    const { razorpayPaymentId, razorpayOrderId, status, signature } = processWebhookDto;

    // Verify webhook signature (implement proper verification in production)
    // For now, we'll trust the webhook data

    // Find payment by order ID
    const payment = await this.prisma.payment.findUnique({
      where: { razorpayOrderId },
      include: {
        registration: true
      }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId,
        status: status as PaymentStatus,
        paidAt: status === 'COMPLETED' ? new Date() : null
      }
    });

    // If payment is successful, update registration status
    if (status === 'COMPLETED') {
      await this.registrationsService.markAsSubmitted(payment.registrationId);
      
      // Update funnel stage to payment completed
      await this.registrationsService.updateFunnelStage(
        payment.registrationId, 
        'PAYMENT_COMPLETED'
      );
    }

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        actorUserId: payment.registration.userId,
        entityType: 'PAYMENT',
        entityId: payment.id,
        action: 'WEBHOOK_PROCESSED',
        dataJson: JSON.stringify({
          razorpayPaymentId,
          status,
          signature
        })
      }
    });

    return updatedPayment;
  }

  async findByRegistration(registrationId: string, userId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId }
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    if (registration.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    return this.prisma.payment.findMany({
      where: { registrationId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        registration: {
          select: { userId: true }
        }
      }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.registration.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        registration: {
          include: {
            society: true
          }
        }
      }
    });
  }
}
