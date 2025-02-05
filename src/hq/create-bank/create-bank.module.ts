import { Module } from '@nestjs/common';
import { CreateBankController } from './create-bank.controller';
import { NeonService } from 'src/services/neon/neon.service';
import { NeonModule } from 'src/services/neon/neon.module';

@Module({
  controllers: [CreateBankController],
  providers: [NeonService],
  imports: [NeonModule],
})
export class CreateBankModule {}
