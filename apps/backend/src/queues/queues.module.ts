import { Module } from '@nestjs/common';
import { WebhookQueueService } from './webhook-queue.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RegistrationsModule } from '../registrations/registrations.module';

@Module({
  imports: [PrismaModule, RegistrationsModule],
  providers: [WebhookQueueService],
  exports: [WebhookQueueService],
})
export class QueuesModule {}
