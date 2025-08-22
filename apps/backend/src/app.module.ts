import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { validate } from './config/env.validation';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SocietiesModule } from './societies/societies.module';
import { FilesModule } from './files/files.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { UploadsModule } from './uploads/uploads.module';
import { PaymentsModule } from './payments/payments.module';
import { RazorpayModule } from './razorpay/razorpay.module';
import { QueuesModule } from './queues/queues.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { SupportModule } from './support/support.module';
import { PrismaModule } from './prisma/prisma.module';
import { MinioModule } from './minio/minio.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [configuration],
      validate,
      cache: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 900, // 15 minutes
        limit: 100,
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // 1 hour
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    MinioModule,
    FirebaseModule,
    AuthModule,
    UsersModule,
    SocietiesModule,
    FilesModule,
    RegistrationsModule,
    UploadsModule,
    PaymentsModule,
    RazorpayModule,
    QueuesModule,
    WebhooksModule,
    SupportModule,
  ],
})
export class AppModule {}
