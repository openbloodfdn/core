import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('hq/request-user-data')
export class RequestUserDataController {
  constructor(private readonly neonService: NeonService,
    private readonly hqAuthService: HqAuthService
  ) {}

  @Post()
  async requestUserData(@Body() request: { bankCode: string, token: string; uuid: string }) {
    let { bankCode, token, uuid } = request;
    let auth = await this.hqAuthService.authenticate(bankCode, token);
    if (auth.error === false) {
      console.log('passed')
      uuid = uuid.replace('bloodbank-', '');
      let donor = await this.neonService.query(
        `SELECT * FROM users WHERE uuid = '${uuid}' AND scope LIKE '%"${bankCode}"%';`,
      );
      console.log(uuid);
      if (donor.length === 0) {
        return { error: true, message: 'Donor is out of your scope or does not exist' };
      } else {
        console.log(donor[0]);
        return { data: donor[0] };
      }
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
