import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

export class TestUtils {
  static async createTestingModule(imports: any[] = []): Promise<TestingModule> {
    return Test.createTestingModule({
      imports: [
        ...imports,
      ],
    }).compile();
  }

  static async createTestingApp(imports: any[] = []): Promise<INestApplication> {
    const module = await this.createTestingModule(imports);
    const app = module.createNestApplication();
    await app.init();
    return app;
  }

  static getMockPrismaService() {
    return {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      registration: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      payment: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      webhookEvent: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        groupBy: jest.fn(),
      },
      $transaction: jest.fn(),
    };
  }

  static getMockJwtService() {
    return {
      sign: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
    };
  }

  static createMockUser(overrides: any = {}) {
    return {
      id: 'user-123',
      firebaseUid: 'firebase-uid-123',
      phone: '+1234567890',
      role: 'OWNER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMockRegistration(overrides: any = {}) {
    return {
      id: 'reg-123',
      userId: 'user-123',
      societyId: 'society-123',
      status: 'PENDING',
      funnelStage: 'INITIATED',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMockPayment(overrides: any = {}) {
    return {
      id: 'payment-123',
      registrationId: 'reg-123',
      razorpayOrderId: 'order-123',
      razorpayPaymentId: 'payment-123',
      status: 'PENDING',
      amount: 1000,
      currency: 'INR',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createMockWebhookEvent(overrides: any = {}) {
    return {
      id: 'webhook-123',
      provider: 'razorpay',
      eventId: 'event-123',
      signature: 'signature-123',
      payloadJson: { test: 'data' },
      status: 'PENDING',
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static generateRazorpaySignature(payload: string, secret: string): string {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }
}
