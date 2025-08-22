import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WebhookSignatureValidator } from './webhook-signature.validator';
import { TestUtils } from '../test/test-utils';

describe('WebhookSignatureValidator', () => {
  let validator: WebhookSignatureValidator;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookSignatureValidator,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'razorpay.webhookSecret') {
                return 'test-webhook-secret';
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    validator = module.get<WebhookSignatureValidator>(WebhookSignatureValidator);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('verifyRazorpaySignature', () => {
    it('should verify valid signature', () => {
      const payload = '{"test": "data"}';
      const signature = TestUtils.generateRazorpaySignature(payload, 'test-webhook-secret');

      const result = validator.verifyRazorpaySignature(payload, signature);

      expect(result).toBe(true);
    });

    it('should reject invalid signature', () => {
      const payload = '{"test": "data"}';
      const invalidSignature = 'invalid-signature';

      const result = validator.verifyRazorpaySignature(payload, invalidSignature);

      expect(result).toBe(false);
    });

    it('should reject signature with wrong secret', () => {
      const payload = '{"test": "data"}';
      const signature = TestUtils.generateRazorpaySignature(payload, 'wrong-secret');

      const result = validator.verifyRazorpaySignature(payload, signature);

      expect(result).toBe(false);
    });

    it('should handle empty payload', () => {
      const payload = '';
      const signature = TestUtils.generateRazorpaySignature(payload, 'test-webhook-secret');

      const result = validator.verifyRazorpaySignature(payload, signature);

      expect(result).toBe(true);
    });

    it('should handle complex JSON payload', () => {
      const payload = JSON.stringify({
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
      });
      const signature = TestUtils.generateRazorpaySignature(payload, 'test-webhook-secret');

      const result = validator.verifyRazorpaySignature(payload, signature);

      expect(result).toBe(true);
    });
  });

  describe('generateSignature', () => {
    it('should generate signature that can be verified', () => {
      const payload = '{"test": "data"}';
      const secret = 'test-webhook-secret';

      const signature = validator.generateSignature(payload, secret);
      const isValid = validator.verifyRazorpaySignature(payload, signature);

      expect(isValid).toBe(true);
    });

    it('should generate different signatures for different payloads', () => {
      const payload1 = '{"test": "data1"}';
      const payload2 = '{"test": "data2"}';
      const secret = 'test-webhook-secret';

      const signature1 = validator.generateSignature(payload1, secret);
      const signature2 = validator.generateSignature(payload2, secret);

      expect(signature1).not.toBe(signature2);
    });

    it('should generate different signatures for different secrets', () => {
      const payload = '{"test": "data"}';
      const secret1 = 'secret1';
      const secret2 = 'secret2';

      const signature1 = validator.generateSignature(payload, secret1);
      const signature2 = validator.generateSignature(payload, secret2);

      expect(signature1).not.toBe(signature2);
    });
  });

  describe('error handling', () => {
    it('should handle missing webhook secret', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      const payload = '{"test": "data"}';
      const signature = 'some-signature';

      expect(() => {
        validator.verifyRazorpaySignature(payload, signature);
      }).toThrow('Webhook secret not configured');
    });

    it('should handle malformed signature', () => {
      const payload = '{"test": "data"}';
      const malformedSignature = 'not-a-hex-string';

      const result = validator.verifyRazorpaySignature(payload, malformedSignature);

      expect(result).toBe(false);
    });
  });
});
