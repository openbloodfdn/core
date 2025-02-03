import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import { SMSService } from 'src/services/sms/sms.service';

@Controller('hq/reject-donor')
export class RejectDonorController {
  constructor(
    private readonly neonService: NeonService,
    private smsService: SMSService,
  ) {}

  @Post()
  async rejectDonor(@Body() request: { token: string; uuid: string }) {
    let { token, uuid } = request;
    let envCode = process.env.HQ_TOKEN;
    if (token === `hq-${envCode}`) {
      uuid = uuid.replace('bloodbank-', '');
      let donor = await this.neonService.query(
        `SELECT phone FROM users WHERE uuid = '${uuid}';`,
      );
      if (donor.length === 0) {
        return { error: true, message: 'Donor not found' };
      }
      try {
        let updatedDonor = await this.neonService.query(
          `DELETE FROM users WHERE uuid = '${uuid}';`,
        );
        //TODO: Add respective blood bank name and contact
        let send = await this.smsService
          .send(
            `+91${donor[0].phone}`,
            `Your Open Blood profile has been rejected. Please contact your blood bank for more information.`,
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
