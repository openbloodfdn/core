import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('hq/get-donor')
export class GetDonorController {
  constructor(private readonly neonService: NeonService,
    private readonly hqAuthService: HqAuthService
  ) {}

  @Post()
  async getDonor(@Body() request: { bankCode: string, token: string; uuid: string }) {
    let { bankCode, token, uuid } = request;
    let auth = await this.hqAuthService.authenticate(bankCode, token);
    if (auth.error === false) {
      uuid = uuid.replace('bloodbank-', '');
      let donor = await this.neonService.query(
        `SELECT name,phone,bloodtype,scope,lastdonated,totaldonated,dob,verified FROM users WHERE uuid = '${uuid}';`// AND scope LIKE '%"${bankCode}"%';`,
      );
      console.log(donor)
      let isOOS = !donor[0].scope.includes(bankCode);
      console.log(donor[0].scope, isOOS)
      if (donor.length === 0) {
        return { error: true, message: 'Donor does not exist' };
      } else {
        return {
          error: false,
          message: 'Donor found',
          data: {...donor[0], oos: isOOS},
        };
      }
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
