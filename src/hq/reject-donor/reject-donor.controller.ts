import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { HQGuard } from 'src/services/auth/hq.guard';
import { NeonService } from 'src/services/neon/neon.service';
import { SMSService } from 'src/services/sms/sms.service';

@Controller('hq/reject-donor')
export class RejectDonorController {
  constructor(
    private readonly neonService: NeonService,
    private readonly smsService: SMSService,
  ) {}
  @UseGuards(HQGuard)
  @Post()
  async rejectDonor(
    @Body() request: { bankCode: string; token: string; uuid: string },
  ) {
    let { bankCode, token, uuid } = request;
    uuid = uuid.replace('bloodbank-', '');
    let donor = await this.neonService.query(
      `SELECT phone,scope,verified FROM users WHERE uuid = '${uuid}' AND scope LIKE '%"${bankCode}"%';`,
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
        await this.neonService.query(
          `UPDATE banks SET total = total - 1 WHERE uuid = '${bankCode}';`,
        );
        if (donor[0].verified === true) {
          await this.neonService.query(
            `UPDATE banks SET verified = verified - 1 WHERE uuid = '${bankCode}';`,
          );
        }
      } else {
        await this.neonService.query(
          `DELETE FROM users WHERE uuid = '${uuid}' AND scope LIKE '%"${bankCode}"%';`,
        );
        await this.neonService.query(
          `UPDATE banks SET total = total - 1 WHERE uuid = '${bankCode}';`,
        );
        if (donor[0].verified === true) {
          await this.neonService.query(
            `UPDATE banks SET verified = verified - 1 WHERE uuid = '${bankCode}';`,
          );
        }
      }

      let getBankDetails = await this.neonService.query(
        `SELECT name,phone FROM banks WHERE uuid = '${bankCode}';`,
      );
      let smsBody: {
        phone: string;
        message: string;
        footer?: string;
      } = {
        phone: `+91${donor[0].phone}`,
        message: `Your Open Blood profile was rejected by ${getBankDetails[0].name}.\n${
          donor[0].scope.length > 1
            ? `You're still a donor with ${donor[0].scope.length - 1} other bank(s).`
            : `Since you're not a donor with any other bank, you will have to reapply for a new Open Blood profile.`
        } Contact ${getBankDetails[0].phone} for more information.`,
      };
      if (donor[0].scope.length <= 1) {
        smsBody.footer = 'Thank you for being with Open Blood.';
      }
      await this.smsService.sendMessage(smsBody).catch(() => {
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
  }
}
