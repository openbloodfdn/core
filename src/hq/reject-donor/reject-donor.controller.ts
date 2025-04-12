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
        `SELECT phone,scope FROM users WHERE uuid = '${uuid}' AND scope LIKE '%"${bankCode}"%';`,
      );
      if (donor.length === 0) {
        return {
          error: true,
          message: 'Donor is out of your scope or does not exist',
        };
      }
      try {
        if (donor[0].scope.length > 1) {
          //remove bankCode from scope array
          let scope = donor[0].scope;
          scope = scope.filter((s) => s !== bankCode);
          console.log(JSON.stringify(scope));
          await this.neonService.query(
            `UPDATE users SET scope = '${JSON.stringify(scope)}' WHERE uuid='${uuid}';`,
          );
        } else {
          let updatedDonor = await this.neonService.query(
            `DELETE FROM users WHERE uuid = '${uuid}' AND scope LIKE '%"${bankCode}"%';`,
          );
        }

        let getBankDetails = await this.neonService.query(
          `SELECT name,phone FROM banks WHERE uuid = '${bankCode}';`,
        );
        let send = await this.smsService
          .send(
            `+91${donor[0].phone}`,
            `Your Open Blood profile was rejected by ${
              getBankDetails[0].name
            }. ${
              donor[0].scope.length > 1
                ? `You're still a donor with ${donor[0].scope.length - 1} other bank${donor[0].scope.length - 1 > 1 ? 's' : ''}.`
                : `Since you're not a donor with any other bank, you will have to reapply for a new Open Blood profile.`
            } You can contact this blood bank for more information at ${
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
