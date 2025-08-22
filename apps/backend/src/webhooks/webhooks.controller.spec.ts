import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookIdempotencyService } from './webhook-idempotency.service';
import { WebhookSignatureValidator } from './webhook-signature.validator';
import { ConfigService } from '@nestjs/config';
import { TestUtils } from '../test/test-utils';

describe('WebhooksController (Integration)', () => {
  let app: INestApplication;
  let webhooksService: WebhooksService;
  let idempotencyService: WebhookIdempotencyService;
  let signatureValidator: WebhookSignatureValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: WebhooksService,
          useValue: {
            processRazorpayWebhook: jest.fn(),
          },
        },
        {
          provide: WebhookIdempotencyService,
          useValue: {
            isEventProcessed: jest.fn(),
            createEvent: jest.fn(),
            markAsProcessing: jest.fn(),
            markAsCompleted: jest.fn(),
            markAsFailed: jest.fn(),
          },
        },
        {
          provide: WebhookSignatureValidator,
          useValue: {
            verifyRazorpaySignature: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'razorpay.webhookSecret') return 'test-webhook-secret';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    webhooksService = module.get<WebhooksService>(WebhooksService);
    idempotencyService = module.get<WebhookIdempotencyService>(WebhookIdempotencyService);
    signatureValidator = module.get<WebhookSignatureValidator>(WebhookSignatureValidator);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /webhooks/razorpay', () => {
    const validPayload = {
      id: 'evt_123',
      entity: 'event',
      account_id: 'acc_123',
      event: 'payment.captured',
      contains: ['payment'],
      created_at: 1234567890,
      payload: {
        payment: {
          entity: {
            id: 'pay_123',
            amount: 1000,
            currency: 'INR',
          },
        },
      },
    };

    const validSignature = TestUtils.generateRazorpaySignature(
      JSON.stringify(validPayload),
      'test-webhook-secret'
    );

    it('should process valid webhook successfully (happy path)', async () => {
      // Mock services
      jest.spyOn(signatureValidator, 'verifyRazorpaySignature').mockReturnValue(true);
      jest.spyOn(idempotencyService, 'isEventProcessed').mockResolvedValue(false);
      jest.spyOn(idempotencyService, 'createEvent').mockResolvedValue('webhook-123');
      jest.spyOn(idempotencyService, 'markAsProcessing').mockResolvedValue();

      jest.spyOn(webhooksService, 'processRazorpayWebhook').mockResolvedValue();
      jest.spyOn(idempotencyService, 'markAsCompleted').mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/webhooks/razorpay')
        .set('X-Razorpay-Signature', validSignature)
        .send(validPayload)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });

      // Verify service calls
      expect(signatureValidator.verifyRazorpaySignature).toHaveBeenCalledWith(
        JSON.stringify(validPayload),
        validSignature
      );
      expect(idempotencyService.isEventProcessed).toHaveBeenCalledWith(
        'razorpay',
        'evt_123'
      );
      expect(idempotencyService.createEvent).toHaveBeenCalled();
      expect(idempotencyService.markAsProcessing).toHaveBeenCalledWith('webhook-123');
      expect(webhooksService.processRazorpayWebhook).toHaveBeenCalledWith(validPayload);
      expect(idempotencyService.markAsCompleted).toHaveBeenCalledWith('webhook-123');
    });

    it('should reject webhook with invalid signature', async () => {
      jest.spyOn(signatureValidator, 'verifyRazorpaySignature').mockReturnValue(false);

      const response = await request(app.getHttpServer())
        .post('/webhooks/razorpay')
        .set('X-Razorpay-Signature', 'invalid-signature')
        .send(validPayload)
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid webhook signature',
      });

      expect(signatureValidator.verifyRazorpaySignature).toHaveBeenCalledWith(
        JSON.stringify(validPayload),
        'invalid-signature'
      );
    });

    it('should handle duplicate webhook (idempotency)', async () => {
      jest.spyOn(signatureValidator, 'verifyRazorpaySignature').mockReturnValue(true);
      jest.spyOn(idempotencyService, 'isEventProcessed').mockResolvedValue(true);

      const response = await request(app.getHttpServer())
        .post('/webhooks/razorpay')
        .set('X-Razorpay-Signature', validSignature)
        .send(validPayload)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Webhook already processed',
      });

      expect(idempotencyService.isEventProcessed).toHaveBeenCalledWith(
        'razorpay',
        'evt_123'
      );
      expect(webhooksService.processRazorpayWebhook).not.toHaveBeenCalled();
    });

    it('should handle webhook processing failure', async () => {
      jest.spyOn(signatureValidator, 'verifyRazorpaySignature').mockReturnValue(true);
      jest.spyOn(idempotencyService, 'isEventProcessed').mockResolvedValue(false);
      jest.spyOn(idempotencyService, 'createEvent').mockResolvedValue('webhook-123');
      jest.spyOn(idempotencyService, 'markAsProcessing').mockResolvedValue();
      jest.spyOn(webhooksService, 'processRazorpayWebhook').mockRejectedValue(
        new Error('Processing failed')
      );
      jest.spyOn(idempotencyService, 'markAsFailed').mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/webhooks/razorpay')
        .set('X-Razorpay-Signature', validSignature)
        .send(validPayload)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Webhook processing failed',
      });

      expect(idempotencyService.markAsFailed).toHaveBeenCalledWith(
        'webhook-123',
        'Processing failed',
        true
      );
    });

    it('should handle missing signature header', async () => {
      const response = await request(app.getHttpServer())
        .post('/webhooks/razorpay')
        .send(validPayload)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Missing webhook signature',
      });
    });

    it('should handle malformed JSON payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/webhooks/razorpay')
        .set('X-Razorpay-Signature', validSignature)
        .set('Content-Type', 'application/json')
        .send('invalid-json')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Bad Request');
      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body.message).toContain('Unexpected token');
    });

    it('should handle missing event ID', async () => {
      const invalidPayload = { ...validPayload };
      delete invalidPayload.id;

      jest.spyOn(signatureValidator, 'verifyRazorpaySignature').mockReturnValue(true);

      const response = await request(app.getHttpServer())
        .post('/webhooks/razorpay')
        .set('X-Razorpay-Signature', validSignature)
        .send(invalidPayload)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Missing event ID',
      });
    });

    it('should handle webhook service timeout', async () => {
      jest.spyOn(signatureValidator, 'verifyRazorpaySignature').mockReturnValue(true);
      jest.spyOn(idempotencyService, 'isEventProcessed').mockResolvedValue(false);
      jest.spyOn(idempotencyService, 'createEvent').mockResolvedValue('webhook-123');
      jest.spyOn(idempotencyService, 'markAsProcessing').mockResolvedValue();
      jest.spyOn(webhooksService, 'processRazorpayWebhook').mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
      );
      jest.spyOn(idempotencyService, 'markAsFailed').mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/webhooks/razorpay')
        .set('X-Razorpay-Signature', validSignature)
        .send(validPayload)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Webhook processing failed',
      });
    });
  });
});
