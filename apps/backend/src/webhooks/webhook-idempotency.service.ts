import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

export interface WebhookEventData {
  provider: string;
  eventId: string;
  signature?: string;
  payload: any;
  processedAt?: Date;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
}

@Injectable()
export class WebhookIdempotencyService {
  private readonly logger = new Logger(WebhookIdempotencyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Check if a webhook event has already been processed
   */
  async isEventProcessed(provider: string, eventId: string): Promise<boolean> {
    const existingEvent = await this.prisma.webhookEvent.findFirst({
      where: {
        provider,
        eventId,
        status: {
          in: ['COMPLETED', 'FAILED']
        }
      }
    });

    return !!existingEvent;
  }

  /**
   * Create a new webhook event record
   */
  async createEvent(data: Omit<WebhookEventData, 'retryCount' | 'maxRetries'>): Promise<string> {
    const maxRetries = this.configService.get('webhook.maxRetries') || 3;
    
    const event = await this.prisma.webhookEvent.create({
      data: {
        provider: data.provider,
        eventId: data.eventId,
        signature: data.signature,
        payloadJson: JSON.stringify(data.payload),
        status: data.status,
        retryCount: 0,
        maxRetries,
        nextRetryAt: data.nextRetryAt,
      }
    });

    this.logger.log(`Created webhook event: ${event.id} for provider: ${data.provider}, eventId: ${data.eventId}`);
    return event.id;
  }

  /**
   * Mark webhook event as processing
   */
  async markAsProcessing(eventId: string): Promise<void> {
    await this.prisma.webhookEvent.update({
      where: { id: eventId },
      data: {
        status: 'PROCESSING',
        processedAt: new Date(),
      }
    });

    this.logger.log(`Marked webhook event as processing: ${eventId}`);
  }

  /**
   * Mark webhook event as completed
   */
  async markAsCompleted(eventId: string): Promise<void> {
    await this.prisma.webhookEvent.update({
      where: { id: eventId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      }
    });

    this.logger.log(`Marked webhook event as completed: ${eventId}`);
  }

  /**
   * Mark webhook event as failed and schedule retry if possible
   */
  async markAsFailed(eventId: string, error: string, shouldRetry: boolean = true): Promise<void> {
    const event = await this.prisma.webhookEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error(`Webhook event not found: ${eventId}`);
    }

    const retryCount = event.retryCount + 1;
    const maxRetries = event.maxRetries;
    const canRetry = shouldRetry && retryCount < maxRetries;

    let status: 'FAILED' | 'PENDING' = 'FAILED';
    let nextRetryAt: Date | undefined;

    if (canRetry) {
      status = 'PENDING';
      const retryDelay = this.configService.get('webhook.retryDelayMs') || 5000;
      nextRetryAt = new Date(Date.now() + retryDelay * Math.pow(2, retryCount - 1)); // Exponential backoff
    }

    await this.prisma.webhookEvent.update({
      where: { id: eventId },
      data: {
        status,
        retryCount,
        nextRetryAt,
        payloadJson: JSON.stringify({
                     ...JSON.parse(event.payloadJson as string),
          lastError: error,
          retryCount,
        })
      }
    });

    if (canRetry) {
      this.logger.warn(`Webhook event ${eventId} failed, scheduled retry ${retryCount}/${maxRetries} at ${nextRetryAt}`);
    } else {
      this.logger.error(`Webhook event ${eventId} failed permanently after ${retryCount} retries`);
    }
  }

  /**
   * Get pending webhook events that need retry
   */
  async getPendingRetries(): Promise<Array<{ id: string; provider: string; eventId: string; payload: any; retryCount: number }>> {
    const now = new Date();
    
    const pendingEvents = await this.prisma.webhookEvent.findMany({
      where: {
        status: 'PENDING',
        nextRetryAt: {
          lte: now
        },
                     retryCount: {
               lt: 3
             }
      },
      select: {
        id: true,
        provider: true,
        eventId: true,
        payloadJson: true,
        retryCount: true,
      }
    });

    return pendingEvents.map(event => ({
      id: event.id,
      provider: event.provider,
      eventId: event.eventId,
             payload: JSON.parse(event.payloadJson as string),
      retryCount: event.retryCount,
    }));
  }

  /**
   * Clean up old webhook events
   */
  async cleanupOldEvents(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.webhookEvent.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        status: {
          in: ['COMPLETED', 'FAILED']
        }
      }
    });

    this.logger.log(`Cleaned up ${result.count} old webhook events`);
    return result.count;
  }

  /**
   * Get webhook event statistics
   */
  async getEventStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    retryRate: number;
  }> {
    const stats = await this.prisma.webhookEvent.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const total = stats.reduce((sum, stat) => sum + stat._count.status, 0);
    const completed = stats.find(s => s.status === 'COMPLETED')?._count.status || 0;
    const failed = stats.find(s => s.status === 'FAILED')?._count.status || 0;
    const pending = stats.find(s => s.status === 'PENDING')?._count.status || 0;
    const processing = stats.find(s => s.status === 'PROCESSING')?._count.status || 0;

    const retryRate = total > 0 ? ((failed + pending) / total) * 100 : 0;

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      retryRate: Math.round(retryRate * 100) / 100,
    };
  }
}
