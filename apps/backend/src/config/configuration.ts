export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  
  database: {
    url: process.env.DATABASE_URL,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    ttl: parseInt(process.env.REDIS_TTL, 10) || 3600,
  },
  
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucket: process.env.MINIO_BUCKET || 'default-bucket',
    useSSL: process.env.MINIO_USE_SSL === 'true',
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    sessionSecret: process.env.SESSION_SECRET,
    cookieSecret: process.env.COOKIE_SECRET,
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 900,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },
  
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'],
    allowedMethods: process.env.ALLOWED_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: process.env.ALLOWED_HEADERS?.split(',') || ['Content-Type', 'Authorization', 'X-Requested-With'],
  },
  
  helmet: {
    contentSecurityPolicy: process.env.HELMET_CONTENT_SECURITY_POLICY === 'true',
    crossOriginEmbedderPolicy: process.env.HELMET_CROSS_ORIGIN_EMBEDDER_POLICY === 'true',
  },
  
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },
  
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  
  webhook: {
    timeoutMs: parseInt(process.env.WEBHOOK_TIMEOUT_MS, 10) || 30000,
    maxRetries: parseInt(process.env.WEBHOOK_MAX_RETRIES, 10) || 3,
    retryDelayMs: parseInt(process.env.WEBHOOK_RETRY_DELAY_MS, 10) || 5000,
  },
});
