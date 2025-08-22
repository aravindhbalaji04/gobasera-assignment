import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Razorpay = require('razorpay');
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService implements OnModuleInit {
  private razorpay: any;
  private webhookSecret: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });
    this.webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
  }

  async createOrder(data: {
    
    amount: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
  }) {
    try {
      const order = await this.razorpay.orders.create({
        amount: data.amount,
        currency: data.currency,
        receipt: data.receipt,
        notes: data.notes,
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      };
    } catch (error) {
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );
    } catch (error) {
      return false;
    }
  }

  getClient() {
    return this.razorpay;
  }
}
