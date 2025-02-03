import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('hq/request-user-data')
export class RequestUserDataController {
  constructor(private readonly neonService: NeonService) {}

  @Post()
  async requestUserData(@Body() request: { token: string; uuid: string }) {
    let { token, uuid } = request;
    let envCode = process.env.HQ_TOKEN;
    console.log(`loginCode: ${token}`);
    if (token === `hq-${envCode}`) {
      uuid = uuid.replace('bloodbank-', '');
      let donor = await this.neonService.query(
        `SELECT * FROM users WHERE uuid = '${uuid}';`,
      );
      console.log(uuid);
      if (donor.length === 0) {
        return { error: true, message: 'Donor not found' };
      } else {
        console.log(donor[0]);
        return { data: donor[0] };
      }
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
