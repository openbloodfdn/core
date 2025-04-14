import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ExpoPushMessage } from 'expo-server-sdk';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';
import { NeonService } from 'src/services/neon/neon.service';
import { NotificationService } from 'src/services/notification/notification.service';
import { SMSService } from 'src/services/sms/sms.service';
@Controller('hq/verify-donor')
export class VerifyDonorController {
  constructor(
    private readonly neonService: NeonService,
    private readonly smsService: SMSService,
    private readonly notificationService: NotificationService,
    private readonly hqAuthService: HqAuthService,
  ) {}

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
    let auth = await this.hqAuthService.authenticate(bankCode, token);
    if (auth.error === false) {
      uuid = uuid.replace('bloodbank-', '');
      let donor = await this.neonService.query(
        `SELECT bloodtype,uuid,phone,notification FROM users WHERE uuid = '${uuid}'` 
        //AND scope LIKE '%"${bankCode}"%';`,
        //TODO: ^ questionable.
      );
      if (donor.length === 0) {
        return { error: true, message: 'Donor is out of your scope or does not exist' };
      } else {
        let updatedDonor = await this.neonService.query(
          `UPDATE users SET bloodtype = '${bloodtype}' WHERE uuid = '${uuid}';`,
        );
        let verifyDonor = await this.neonService.query(
          `UPDATE users SET verified = true WHERE uuid = '${uuid}';`,
        );
        let updateBank = await this.neonService.query(
          `UPDATE banks SET verified = verified + 1 WHERE uuid = '${bankCode}';`,
        );
        let getLog = await this.neonService.query(`
          SELECT log FROM users WHERE uuid = '${uuid}';`);
        let log = getLog[0].log;
        log.push({
          x: `v-${bloodtype}`,
          y: new Date().toISOString(),
        });
        let updatedLog = await this.neonService.query(
          `UPDATE users SET log ='${JSON.stringify(log).replace(/'/g, "''")}' WHERE uuid = '${uuid}';`,
        );
        if (conditions.trim() != '') {
          let updatedConditions = await this.neonService.query(
            `UPDATE users SET conditions = ${conditions}' WHERE uuid = '${uuid}';`,
          );
        }
        if (medications.trim() != '') {
          let updatedMedications = await this.neonService.query(
            `UPDATE users SET medications = '${medications}' WHERE uuid = '${uuid}';`,
          );
        }
        if (
          await this.notificationService.isValidToken(donor[0].notification)
        ) {
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
            .send(
              `+91${donor[0].phone}`,
              `You've been verified as a donor for blood type ${bloodtype}! Please contact the blood bank if there are any issues.`,
            )
            .catch((err) => {
              return { error: true, message: 'Error sending verification SMS' };
            });
        }
        return { error: false, message: 'Records updated' };
      }
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
