import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import { SMSService } from 'src/services/sms/sms.service';
@Controller('hq/verify-donor')
export class VerifyDonorController {
  constructor(
    private readonly neonService: NeonService,
    private smsService: SMSService,
  ) {}

  @Post()
  async verifyDonor(
    @Body()
    request: {
      token: string;
      uuid: string;
      bloodtype: string;
      conditions: string;
      medications: string;
    },
  ) {
    let { token, uuid, bloodtype, conditions, medications } = request;
    let envCode = process.env.HQ_TOKEN;
    if (token === `hq-${envCode}`) {
      uuid = uuid.replace('bloodbank-', '');
      let donor = await this.neonService.query(
        `SELECT bloodtype,uuid,phone FROM users WHERE uuid = '${uuid}';`,
      );
      if (donor.length === 0) {
        return { error: true, message: 'Donor not found' };
      } else {
        let updatedDonor = await this.neonService.query(
          `UPDATE users SET bloodtype = '${bloodtype}' WHERE uuid = '${uuid}';`,
        );
        let verifyDonor = await this.neonService.query(
          `UPDATE users SET verified = true WHERE uuid = '${uuid}';`,
        );
        let updatedLog = await this.neonService.query(
          `UPDATE users SET log = log || '${JSON.stringify({
            x: `v-${bloodtype}`,
            y: new Date().toISOString(),
          })}'::jsonb WHERE uuid = '${uuid}';`,
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
        let send = await this.smsService
          .send(
            `+91${donor[0].phone}`,
            `You've been verified as a donor for blood type ${bloodtype}! Please contact the blood bank if there are any issues.`,
          )
          .catch((err) => {
            return { error: true, message: 'Error sending verification SMS' };
          });
        console.log(send);
        return { error: false, message: 'Records updated' };
      }
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
