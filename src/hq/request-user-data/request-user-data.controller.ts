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

@Controller('hq/request-user-data')
export class RequestUserDataController {
  constructor(
    private readonly neonService: NeonService,
    private readonly authService: AuthService,
  ) {}
  @UseGuards(HQGuard)
  @Post()
  async requestUserData(
    @Body() request: { bankCode: string; token: string; uuid: string },
  ) {
    let { bankCode, token, uuid } = request;
    uuid = uuid.replace('ob-', '');
    if ((await this.authService.verify(uuid)) !== false) {
      let uuidObj = await this.authService.decode(uuid);
      console.log('uuid object', uuidObj);
      if (uuidObj.intent !== 'qr') {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      uuid = uuidObj.sub;
    }
    console.log('passed');
    let donor = await this.neonService.query(
      `SELECT * FROM users WHERE uuid = '${uuid}' AND scope LIKE '%"${bankCode}"%';`,
    );
    console.log(uuid);
    if (donor.length === 0) {
      return {
        error: true,
        message: 'Donor is out of your scope or does not exist',
      };
    } else {
      console.log(donor[0]);
      return { data: donor[0] };
    }
  }
}
