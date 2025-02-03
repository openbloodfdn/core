import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';
import { NotificationService } from 'src/services/notification/notification.service';
import { SMSService } from 'src/services/sms/sms.service';
import { ExpoPushMessage } from 'expo-server-sdk';

@Controller('hq/request-blood')
export class RequestBloodController {
  constructor(
    private readonly neonService: NeonService,
    private readonly notificationService: NotificationService,
    private readonly smsService: SMSService,
  ) {}

  @Post()
  async requestBlood(
    @Body()
    request: {
      type: string;
      token: string;
      units: number;
      months: number;
      contact: string;
    },
  ) {
    let { type, token, units, months, contact } = request;
    let envCode = process.env.HQ_TOKEN;

    //check if units and months are numbers
    /*if (isNaN(units) || isNaN(months)) {
    return Response.json({ error: true, message: "Invalid number of units or months." })
  }*/
    if (token === `hq-${envCode}`) {
      let now = new Date();
      //get time 3 months ago as a date object
      let minimumDate = new Date(
        now.getFullYear(),
        now.getMonth() - months,
        now.getDate(),
      );
      console.log(minimumDate);
      let prompt = `SELECT name,notification,phone FROM users WHERE bloodtype = '${type}' ${
        months > 0
          ? `AND (lastdonated < '${minimumDate.toISOString()}' OR lastdonated IS NULL)`
          : ''
      };`;
      console.log(prompt);
      let donors = await this.neonService.query(prompt);
      console.log(donors);
      if (donors.length === 0) {
        return { error: true, message: 'No donors found.' };
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
              .send(notificationobj.phone, `test message, disregard.`)
              /*`JIPMER Blood Center requires ${units} unit${
                  units == 1 ? '' : 's'
                } of ${type} blood. Please contact ${contact} if you can donate.`,
              )*/
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
            subtitle: `Blood Center requires ${units} unit${
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
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
