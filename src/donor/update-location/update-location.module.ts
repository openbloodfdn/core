import { Module } from '@nestjs/common';
import { UpdateLocationController } from './update-location.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [UpdateLocationController],
  providers: [NeonService],
  imports: [NeonModule],
})
export class UpdateLocationModule {}
