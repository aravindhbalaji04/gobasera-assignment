import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WebhookSignatureValidator {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Verify Razorpay webhook signature
   */
  verifyRazorpaySignature(payload: string, signature: string): boolean {
    const webhookSecret = this.configService.get('razorpay.webhookSecret');
    
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    try {
      const expectedSignature = this.generateSignature(payload, webhookSecret);
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate HMAC signature for testing purposes
   */
  generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }
}
