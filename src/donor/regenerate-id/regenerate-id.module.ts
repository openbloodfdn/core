import { Module } from '@nestjs/common';
import { RegenerateIdController } from './regenerate-id.controller';
import { NeonModule } from 'src/services/neon/neon.module';
import { NeonService } from 'src/services/neon/neon.service';

@Module({
  controllers: [RegenerateIdController],
  providers: [NeonService],
  imports: [NeonModule],
})
export class RegenerateIdModule {}
