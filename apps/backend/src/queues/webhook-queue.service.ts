import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationsService } from '../registrations/registrations.service';
import { WebhookJobData } from './dto/webhook-job.dto';

@Injectable()
export class WebhookQueueService implements OnModuleInit {
  private webhookQueue: Queue;
  private webhookWorker: Worker;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private registrationsService: RegistrationsService,
  ) {}

  onModuleInit() {
    // Create the webhook processing queue
    this.webhookQueue = new Queue('webhook-processing', {
      connection: {
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get('REDIS_PORT', 6379),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 seconds
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });

    // Create the worker to process webhook jobs
    this.webhookWorker = new Worker(
      'webhook-processing',
      async (job: Job<WebhookJobData>) => {
        return this.processWebhookJob(job);
      },
      {
        connection: {
          host: this.configService.get('REDIS_HOST', 'localhost'),
          port: this.configService.get('REDIS_PORT', 6379),
        },
        concurrency: 5,
      },
    );

    // Handle worker events
    this.webhookWorker.on('completed', (job) => {
      console.log(`✅ Webhook job ${job.id} completed successfully`);
    });

    this.webhookWorker.on('failed', (job, err) => {
      console.error(`❌ Webhook job ${job.id} failed:`, err.message);
    });

    this.webhookWorker.on('error', (err) => {
      console.error('❌ Webhook worker error:', err);
    });
  }

  async addWebhookJob(data: WebhookJobData) {
    const jobId = `${data.orderId}:${data.paymentId}`;
    
    // Check for existing job to ensure idempotency
    const existingJob = await this.webhookQueue.getJob(jobId);
    if (existingJob) {
      console.log(`🔄 Webhook job already exists for ${jobId}`);
      return existingJob;
    }

    return this.webhookQueue.add(
      'process-webhook',
      data,
      {
        jobId,
        priority: 1,
      }
    );
  }

  private async processWebhookJob(job: Job<WebhookJobData>): Promise<void> {
    const { orderId, paymentId, status, amount, currency } = job.data;

    // Use database transaction for data consistency
    await this.prisma.$transaction(async (tx) => {
      // Check if webhook event already processed (idempotency)
      const existingEvent = await tx.webhookEvent.findFirst({
        where: {
          OR: [
            { eventId: `${orderId}:${paymentId}` },
            { eventId: orderId },
          ],
          status: 'COMPLETED',
        },
      });

      if (existingEvent) {
        console.log(`🔄 Webhook already processed for ${orderId}:${paymentId}`);
        return;
      }

      // Find payment by order ID
      const payment = await tx.payment.findUnique({
        where: { razorpayOrderId: orderId },
        include: { registration: true },
      });

      if (!payment) {
        throw new Error(`Payment not found for order ${orderId}`);
      }

      // Update payment status
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: paymentId,
          status: status as any,
          paidAt: status === 'COMPLETED' ? new Date() : null,
        },
      });

             // If payment successful, update registration
       if (status === 'COMPLETED') {
         await tx.registration.update({
           where: { id: payment.registrationId },
           data: {
             status: 'PENDING', // Registration moves to PENDING after payment
             funnelStage: 'PAYMENT_COMPLETED',
             submittedAt: new Date(),
           },
         });
       }

      // Mark webhook event as processed
      await tx.webhookEvent.update({
        where: { eventId: `${orderId}:${paymentId}` },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorUserId: payment.registration.userId,
          entityType: 'PAYMENT',
          entityId: payment.id,
          action: 'WEBHOOK_PROCESSED',
          dataJson: {
            orderId,
            paymentId,
            status,
            amount,
            currency,
          },
        },
      });
    });
  }

  async onModuleDestroy() {
    await this.webhookQueue.close();
    await this.webhookWorker.close();
  }
}
