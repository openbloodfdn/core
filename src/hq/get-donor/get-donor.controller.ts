import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('hq/get-donor')
export class GetDonorController {
  constructor(private readonly neonService: NeonService) {}

  @Post()
  async getDonor(@Body() request: { token: string; uuid: string }) {
    let { token, uuid } = request;
    let envCode = process.env.HQ_TOKEN;
    if (token === `hq-${envCode}`) {
      uuid = uuid.replace('bloodbank-', '');
      let donor = await this.neonService.query(
        `SELECT name,phone,bloodtype,lastdonated,totaldonated,dob,verified FROM users WHERE uuid = '${uuid}';`,
      );
      if (donor.length === 0) {
        return { error: true, message: 'Donor not found' };
      } else {
        return {
          error: false,
          message: 'Donor found',
          data: donor[0],
        };
      }
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
