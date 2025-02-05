import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';
import { NeonService } from 'src/services/neon/neon.service';
import { SMSService } from 'src/services/sms/sms.service';

@Controller('hq/reject-donor')
export class RejectDonorController {
  constructor(
    private readonly neonService: NeonService,
    private readonly smsService: SMSService,
    private readonly hqAuthService: HqAuthService,
  ) {}

  @Post()
  async rejectDonor(
    @Body() request: { bankCode: string; token: string; uuid: string },
  ) {
    let { bankCode, token, uuid } = request;
    let auth = await this.hqAuthService.authenticate(bankCode, token);
    if (auth.error === false) {
      uuid = uuid.replace('bloodbank-', '');
      let donor = await this.neonService.query(
        `SELECT phone FROM users WHERE uuid = '${uuid}' AND scope LIKE '%"${bankCode}"%';`,
      );
      if (donor.length === 0) {
        return {
          error: true,
          message: 'Donor is out of your scope or does not exist',
        };
      }
      try {
        let updatedDonor = await this.neonService.query(
          `DELETE FROM users WHERE uuid = '${uuid}' AND scope LIKE '%"${bankCode}"%';`,
        );
        let getBankDetails = await this.neonService.query(
          `SELECT name,phone FROM banks WHERE uuid = '${bankCode}';`,
        );
        let send = await this.smsService
          .send(
            `+91${donor[0].phone}`,
            `Your Open Blood profile has been rejected by ${
              getBankDetails[0].name
            }. Please contact your blood bank for more information at ${
              getBankDetails[0].phone
            }`,
          )
          .catch(() => {
            return {
              error: true,
              message: 'Error sending rejection SMS',
            };
          });
        return { error: false, message: 'Records updated' };
      } catch (err) {
        return {
          error: false,
          message: `Error sending rejection SMS.`,
        };
      }
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
