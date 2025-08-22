import { ConfigModule } from '@nestjs/config';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.MINIO_ENDPOINT = 'localhost';
process.env.MINIO_ACCESS_KEY = 'test';
process.env.MINIO_SECRET_KEY = 'test';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.RAZORPAY_KEY_ID = 'test-key';
process.env.RAZORPAY_KEY_SECRET = 'test-secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test-webhook-secret';

// Global test configuration
beforeAll(async () => {
  // Setup test database if needed
});

afterAll(async () => {
  // Cleanup test database if needed
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
