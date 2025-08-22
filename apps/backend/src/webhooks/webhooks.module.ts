import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { RazorpayModule } from '../razorpay/razorpay.module';
import { QueuesModule } from '../queues/queues.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [RazorpayModule, QueuesModule, PrismaModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
