import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/services/auth/auth.service';
import { HQGuard } from 'src/services/auth/hq.guard';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('hq/get-donor')
export class GetDonorController {
  constructor(
    private readonly neonService: NeonService,
    private readonly authService: AuthService,
  ) {}
  @UseGuards(HQGuard)
  @Post()
  async getDonor(
    @Body() request: { bankCode: string; token: string; uuid: string },
  ) {
    let { bankCode, token, uuid } = request;
    uuid = uuid.replace('ob-', '')
    let uuidObj = await this.authService.decode(uuid);
    console.log('uuid object', uuidObj);
    if (uuidObj.intent !== 'qr') {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    uuid = uuidObj.sub;
    let donor = await this.neonService.query(
      `SELECT uuid,name,phone,bloodtype,scope,lastdonated,totaldonated,dob,verified FROM users WHERE uuid = '${uuid}';`, // AND scope LIKE '%"${bankCode}"%';`,
    );
   //console.log(donor);
    let isOOS = !donor[0].scope.includes(bankCode);
    //console.log(donor[0].scope, isOOS);
    console.log({
      error: false,
      message: 'Donor found',
      data: { ...donor[0], oos: isOOS },
    });
    if (donor.length === 0) {
      return { error: true, message: 'Donor does not exist' };
    } else {
      return {
        error: false,
        message: 'Donor found',
        data: { ...donor[0], oos: isOOS },
      };
    }
  }
}
