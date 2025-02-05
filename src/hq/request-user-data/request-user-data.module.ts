import { Module } from '@nestjs/common';
import { RequestUserDataController } from './request-user-data.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';

@Module({
  controllers: [RequestUserDataController],
  providers: [NeonService, HqAuthService],
  imports: [NeonModule],
})
export class RequestUserDataModule {}
