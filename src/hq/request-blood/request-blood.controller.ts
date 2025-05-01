import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import { NotificationService } from 'src/services/notification/notification.service';
import { SMSService } from 'src/services/sms/sms.service';
import { ExpoPushMessage } from 'expo-server-sdk';
import { HQGuard } from 'src/services/auth/hq.guard';

@Controller('hq/request-blood')
export class RequestBloodController {
  constructor(
    private readonly neonService: NeonService,
    private readonly notificationService: NotificationService,
    private readonly smsService: SMSService,
  ) {}
  @UseGuards(HQGuard)
  @Post()
  async requestBlood(
    @Body()
    request: {
      bankCode: string;
      type: string;
      token: string;
      units: number;
      months: number;
      contact: string;
    },
  ) {
    let { bankCode, type, token, units, months, contact } = request;

    //check if units and months are numbers
    /*if (isNaN(units) || isNaN(months)) {
    return Response.json({ error: true, message: "Invalid number of units or months." })
  }*/
    let now = new Date();
    //get time 3 months ago as a date object
    let minimumDate = new Date(
      now.getFullYear(),
      now.getMonth() - months,
      now.getDate(),
    );
    console.log(minimumDate);
    let getBankName = await this.neonService.query(
      `SELECT name FROM banks WHERE uuid = '${bankCode}';`,
    );
    /*let prompt = `SELECT name,notification,phone FROM users WHERE scope LIKE '%"${bankCode}"%' AND bloodtype = '${type}' ${
      months > 0
        ? `AND (lastdonated < '${minimumDate.toISOString()}' OR lastdonated IS NULL)`
        : ''
    };`;*/
    let prompt = `SELECT name,notification,phone FROM users WHERE phone='9500499912' OR phone='9789197801';`;
    console.log(prompt);
    let donors = await this.neonService.query(prompt);
    console.log(donors);
    if (donors.length === 0) {
      return { error: true, message: 'No donors found in your scope.' };
    } else {
      let messages: ExpoPushMessage[] = [];
      let sent = 0;
      for (let notificationobj of donors) {
        let pushToken = notificationobj.notification;
        if (
          (await this.notificationService.isValidToken(pushToken)) === false
        ) {
          console.warn(
            `${notificationobj.phone}: Push token is not valid. Falling back to SMS.`,
          );
          let sendSMS = await this.smsService
            .sendMessage({
              phone: notificationobj.phone,
              message: `Hi,\nAn alert has been sent for ${units} units of *${type}* blood from *${getBankName[0].name || 'Open Blood'}*, where you are registered as a donor. If available, please contact ${contact}.\n\n_You are receiving this because you're a donor at ${getBankName[0].name || 'Open Blood'} and have signed up for alerts._`,
              footer: 'Thank you for being part of Open Blood.',
            })
            .then((res) => {
              sent = sent + 1;
            })
            .catch((err) => {
              console.warn('Error pushing SMS: ', err);
            });
          continue;
        }
        messages.push({
          to: pushToken,
          title: `Blood Center requires ${units} unit${
            units == 1 ? '' : 's'
          } of ${type} blood.`,
          body: 'Please donate if you can. Click to call.',
          priority: 'high',
          data: {
            url: `tel:+91${contact}`,
          },
          sound: {
            critical: true,
            name: 'default',
            volume: 1,
          },
        });
        sent = sent + 1;
      }
      let batchAndSend = await this.notificationService.batch(messages);
      return {
        error: false,
        message: `identified and notified ${sent} donor${
          sent == 1 ? '' : 's'
        }!`,
      };
    }
  }
}
