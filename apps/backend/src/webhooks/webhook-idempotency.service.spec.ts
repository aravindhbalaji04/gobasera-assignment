import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { WebhookIdempotencyService } from './webhook-idempotency.service';

describe('WebhookIdempotencyService', () => {
  let service: WebhookIdempotencyService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookIdempotencyService,
        {
          provide: PrismaService,
          useValue: {
            webhookEvent: {
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              deleteMany: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'webhook.maxRetries') return 3;
              if (key === 'webhook.retryDelayMs') return 5000;
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WebhookIdempotencyService>(WebhookIdempotencyService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should check if event is processed', async () => {
    const mockEvent = { id: 'test-id', status: 'COMPLETED' };
    jest.spyOn(prismaService.webhookEvent, 'findFirst').mockResolvedValue(mockEvent as any);

    const result = await service.isEventProcessed('razorpay', 'test-event-id');
    expect(result).toBe(true);
  });

  it('should create a new webhook event', async () => {
    const mockEvent = { id: 'new-event-id' };
    jest.spyOn(prismaService.webhookEvent, 'create').mockResolvedValue(mockEvent as any);

    const result = await service.createEvent({
      provider: 'razorpay',
      eventId: 'test-event-id',
      payload: { test: 'data' },
      status: 'PENDING',
    });

    expect(result).toBe('new-event-id');
  });
});
