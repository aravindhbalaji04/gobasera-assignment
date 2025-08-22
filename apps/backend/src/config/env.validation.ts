import { plainToClass } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, validateSync, IsUrl } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  PORT: number;

  @IsString()
  NODE_ENV: string;

  @IsString()
  API_PREFIX: string;

  @IsUrl()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsUrl()
  REDIS_URL: string;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;

  @IsNumber()
  REDIS_TTL: number;

  @IsString()
  MINIO_ENDPOINT: string;

  @IsNumber()
  MINIO_PORT: number;

  @IsString()
  MINIO_ACCESS_KEY: string;

  @IsString()
  MINIO_SECRET_KEY: string;

  @IsString()
  MINIO_BUCKET: string;

  @IsBoolean()
  MINIO_USE_SSL: boolean;

  @IsNumber()
  BCRYPT_ROUNDS: number;

  @IsString()
  SESSION_SECRET: string;

  @IsString()
  COOKIE_SECRET: string;

  @IsNumber()
  RATE_LIMIT_WINDOW_MS: number;

  @IsNumber()
  RATE_LIMIT_MAX_REQUESTS: number;

  @IsNumber()
  THROTTLE_TTL: number;

  @IsNumber()
  THROTTLE_LIMIT: number;

  @IsArray()
  @IsString({ each: true })
  ALLOWED_ORIGINS: string[];

  @IsArray()
  @IsString({ each: true })
  ALLOWED_METHODS: string[];

  @IsArray()
  @IsString({ each: true })
  ALLOWED_HEADERS: string[];

  @IsBoolean()
  HELMET_CONTENT_SECURITY_POLICY: boolean;

  @IsBoolean()
  HELMET_CROSS_ORIGIN_EMBEDDER_POLICY: boolean;

  @IsString()
  FIREBASE_PROJECT_ID: string;

  @IsString()
  FIREBASE_PRIVATE_KEY: string;

  @IsString()
  FIREBASE_CLIENT_EMAIL: string;

  @IsString()
  RAZORPAY_KEY_ID: string;

  @IsString()
  RAZORPAY_KEY_SECRET: string;

  @IsString()
  RAZORPAY_WEBHOOK_SECRET: string;

  @IsNumber()
  WEBHOOK_TIMEOUT_MS: number;

  @IsNumber()
  WEBHOOK_MAX_RETRIES: number;

  @IsNumber()
  WEBHOOK_RETRY_DELAY_MS: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  
  const errors = validateSync(validatedConfig, { 
    skipMissingProperties: false,
    forbidNonWhitelisted: true,
    whitelist: true,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }
  
  return validatedConfig;
}
