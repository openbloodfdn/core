import { Controller, Get } from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
let inReview = process.env.inReview;
@Controller('donor/banks')
export class BanksController {
  constructor(private readonly neonService: NeonService) {}

  @Get()
  async getBanks() {
    let banks = await this.neonService.query(
      `SELECT name,phone,uuid,coords,region FROM banks;`,
    );
    if (inReview == 'true') {
      banks = banks.filter(
        (bank: {
          uuid: string;
          name: string;
          phone: string;
          region: string;
          coords: string;
        }) => bank.uuid == 'staging',
      );
    } else {
      banks = banks.filter(
        (bank: {
          uuid: string;
          name: string;
          phone: string;
          region: string;
          coords: string;
        }) => bank.uuid != 'staging',
      );
    }
    return { error: false, banks: banks };
  }
}
