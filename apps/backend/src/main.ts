import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Rate limiting for public routes
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for authenticated routes
      return req.path.startsWith('/api/v1/auth/verify') || 
             req.path.startsWith('/api/v1/support/') ||
             req.path.startsWith('/api/v1/registrations/') ||
             req.path.startsWith('/api/v1/payments/') ||
             req.path.startsWith('/api/v1/uploads/');
    }
  });
  app.use(limiter);

  // Global prefix
  app.setGlobalPrefix(configService.get('API_PREFIX') || 'api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: configService.get('NODE_ENV') === 'production' 
      ? configService.get('ALLOWED_ORIGINS')?.split(',') || ['https://yourdomain.com']
      : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Society Registration API')
      .setDescription('A comprehensive API for managing society registrations, payments, and support operations')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('registrations', 'Society registration management')
      .addTag('payments', 'Payment processing and management')
      .addTag('support', 'Support operations and analytics')
      .addTag('uploads', 'File upload and document management')
      .addTag('webhooks', 'Webhook processing')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    
    // Export Postman collection
    const fs = require('fs');
    const path = require('path');
    const postmanCollection = {
      info: {
        name: 'Society Registration API',
        description: 'Postman collection for Society Registration API',
        version: '1.0.0'
      },
      item: []
    };
    
    // Convert Swagger paths to Postman format
    Object.entries(document.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        if (method !== 'parameters') {
          const item = {
            name: operation.summary || `${method.toUpperCase()} ${path}`,
            request: {
              method: method.toUpperCase(),
              header: [],
              url: {
                raw: `{{baseUrl}}${path}`,
                host: ['{{baseUrl}}'],
                path: path.split('/').filter(p => p)
              }
            }
          };
          
          // Add auth header if required
          if (operation.security && operation.security.length > 0) {
            item.request.header.push({
              key: 'Authorization',
              value: 'Bearer {{authToken}}',
              type: 'text'
            });
          }
          
          postmanCollection.item.push(item);
        }
      });
    });
    
    // Write Postman collection
    const postmanPath = path.join(__dirname, '../postman-collection.json');
    fs.writeFileSync(postmanPath, JSON.stringify(postmanCollection, null, 2));
    console.log(`📋 Postman collection exported to: ${postmanPath}`);
  }

  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/docs`);
  console.log(`🔒 Security: Helmet enabled, Rate limiting active, CORS configured`);
}

bootstrap();
