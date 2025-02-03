import { Module } from '@nestjs/common';
import { RequestUserDataController } from './request-user-data.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [RequestUserDataController],
  providers: [NeonService],
  imports: [NeonModule],
})
export class RequestUserDataModule {}
