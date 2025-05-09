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
import { NotificationService } from 'src/services/notification/notification.service';
import { SMSService } from 'src/services/sms/sms.service';
@Controller('hq/verify-donor')
export class VerifyDonorController {
  constructor(
    private readonly neonService: NeonService,
    private readonly smsService: SMSService,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
  ) {}
  @UseGuards(HQGuard)
  @Post()
  async verifyDonor(
    @Body()
    request: {
      bankCode: string;
      token: string;
      uuid: string;
      bloodtype: string;
      conditions: string;
      medications: string;
    },
  ) {
    let { bankCode, token, uuid, bloodtype, conditions, medications } = request;
    uuid = uuid.replace('ob-', '');
    if ((await this.authService.verify(uuid)) !== false) {
      let uuidObj = await this.authService.decode(uuid);
      if (uuidObj.intent !== 'qr') {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      uuid = uuidObj.sub;
    }
    let donor = await this.neonService.query(
      `SELECT bloodtype,uuid,phone,notification,verified FROM users WHERE uuid = '${uuid}'`,
      //AND scope LIKE '%"${bankCode}"%';`,
      //TODO: ^ questionable.
    );
    if (donor.length === 0) {
      return {
        error: true,
        message: 'Donor is out of your scope or does not exist',
      };
    } else {
      let updatedDonor = await this.neonService.query(
        `UPDATE users SET bloodtype = '${bloodtype}' WHERE uuid = '${uuid}';`,
      );
      if (donor[0].verified !== true) {
        let verifyDonor = await this.neonService.query(
          `UPDATE users SET verified = true WHERE uuid = '${uuid}';`,
        );
        let updateBank = await this.neonService.query(
          `UPDATE banks SET verified = verified + 1 WHERE uuid = '${bankCode}';`,
        );
      }
      let getLog = await this.neonService.query(`SELECT log FROM users WHERE uuid = '${uuid}';`);
      let log = getLog[0].log;
      log.push({
        x: `v-${bloodtype}`,
        y: new Date().toISOString(),
      });
      let updatedLog = await this.neonService.execute(
        `UPDATE users SET log = $1 WHERE uuid = $2;`,
        [JSON.stringify(log), uuid],
      );
      if (conditions.trim() != '') {
        let updatedConditions = await this.neonService.query(
          `UPDATE users SET conditions = '${conditions}' WHERE uuid = '${uuid}';`,
        );
      }
      if (medications.trim() != '') {
        let updatedMedications = await this.neonService.query(
          `UPDATE users SET medications = '${medications}' WHERE uuid = '${uuid}';`,
        );
      }
      if (await this.notificationService.isValidToken(donor[0].notification)) {
        let send = this.notificationService
          .batch([
            {
              to: donor[0].notification,
              title: `You've been verified as a donor for blood type ${bloodtype}!`,
              body: `Please contact the blood bank if there are any issues.`,
              sound: {
                critical: false,
                volume: 1,
              },
            },
          ])
          .catch((err) => {
            return {
              error: true,
              message: 'Error sending verification notification',
            };
          });
      } else {
        let send = await this.smsService
          .sendMessage({
            phone: `91${donor[0].phone}`,
            message: `You've been verified as a donor for blood type ${bloodtype}! Please contact the blood bank if there are any issues.`,
            footer: 'Thank you for being a part of Open Blood.',
          })
          .catch((err) => {
            return {
              error: true,
              message: 'Error sending verification message',
            };
          });
      }
      return { error: false, message: 'Records updated' };
    }
  }
}
