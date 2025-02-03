import { Controller, Get } from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('donor/banks')
export class BanksController {
  constructor(private readonly neonService: NeonService) {}

  @Get()
  async getBanks() {
    let banks = await this.neonService.query(`SELECT * FROM banks;`);
    return { error: false, banks: banks };
  }
}
