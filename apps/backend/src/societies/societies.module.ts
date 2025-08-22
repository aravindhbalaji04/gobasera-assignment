import { Module, forwardRef } from '@nestjs/common';
import { SocietiesService } from './societies.service';
import { SocietiesController } from './societies.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), UsersModule],
  controllers: [SocietiesController],
  providers: [SocietiesService],
  exports: [SocietiesService],
})
export class SocietiesModule {}
