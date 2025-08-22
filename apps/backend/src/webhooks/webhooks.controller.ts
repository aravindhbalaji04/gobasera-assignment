import { Controller, Post, Body, Headers, HttpCode, HttpStatus, BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookIdempotencyService } from './webhook-idempotency.service';
import { WebhookSignatureValidator } from './webhook-signature.validator';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly idempotencyService: WebhookIdempotencyService,
    private readonly signatureValidator: WebhookSignatureValidator,
  ) {}

  @Post('razorpay')
  @HttpCode(HttpStatus.OK)
  async handleRazorpayWebhook(
    @Body() payload: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    // Validate signature
    if (!signature) {
      throw new BadRequestException({
        success: false,
        message: 'Missing webhook signature',
      });
    }

    // Verify signature
    const isValidSignature = this.signatureValidator.verifyRazorpaySignature(
      JSON.stringify(payload),
      signature,
    );

    if (!isValidSignature) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    // Validate payload has required fields
    if (!payload || !payload.id) {
      throw new BadRequestException({
        success: false,
        message: 'Missing event ID',
      });
    }

    // Check if event already processed
    if (await this.idempotencyService.isEventProcessed('razorpay', payload.id)) {
      return {
        success: true,
        message: 'Webhook already processed',
      };
    }

    // Create webhook event record
    const eventId = await this.idempotencyService.createEvent({
      provider: 'razorpay',
      eventId: payload.id,
      signature,
      payload,
      status: 'PENDING',
    });

    try {
      // Mark as processing
      await this.idempotencyService.markAsProcessing(eventId);

      // Process webhook
      await this.webhooksService.processRazorpayWebhook(payload);

      // Mark as completed
      await this.idempotencyService.markAsCompleted(eventId);

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      // Mark as failed
      await this.idempotencyService.markAsFailed(eventId, error.message, true);

      throw new InternalServerErrorException({
        success: false,
        message: 'Webhook processing failed',
      });
    }
  }
}
