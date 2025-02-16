import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Server } from 'ws';
import { ExpoPushMessage } from 'expo-server-sdk';
import { NeonService } from './services/neon/neon.service';
import { NotificationService } from './services/notification/notification.service';
import { SMSService } from './services/sms/sms.service';
import { HqAuthService } from './services/hq-auth/hq-auth.service';
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const server = app.getHttpServer();
  const wss = new Server({ noServer: true });
  let neonService = app.get(NeonService);
  let notificationService = app.get(NotificationService);
  let smsService = app.get(SMSService);
  let hqAuthService = app.get(HqAuthService);

  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/request') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data.bankCode);
        if (
          data.bankCode !== undefined &&
          data.token !== undefined &&
          data.type !== undefined &&
          data.units !== undefined &&
          data.months !== undefined &&
          data.contact !== undefined
        ) {
          console.log(
            'Received data with bankCode, token, type, units, months, contact:',
            data,
          );
          let { bankCode, token, type, units, months, contact } = data;
          let auth = await hqAuthService.authenticate(bankCode, token);
          console.log('Auth:', auth);
          if (auth.error === false) {
            ws.send(`%ckpt%1%true`);
            let now = new Date();
            //get time 3 months ago as a date object
            let minimumDate = new Date(
              now.getFullYear(),
              now.getMonth() - months,
              now.getDate(),
            );
            console.log(minimumDate);
            let prompt = `SELECT name,notification,phone FROM users WHERE scope LIKE '%"${bankCode}"%' AND bloodtype = '${type}' ${
              months > 0
                ? `AND (lastdonated < '${minimumDate.toISOString()}' OR lastdonated IS NULL)`
                : ''
            };`;
            console.log(prompt);
            let donors = await neonService.query(prompt);
            let bankName = await neonService.query(
              `SELECT name FROM banks WHERE code = '${bankCode}';`,
            );
            console.log(donors);
            if (donors.length === 0) {
              ws.send(`%err%No donors found in your scope.`);
            } else {
              let messages: ExpoPushMessage[] = [];
              let sentSMS = 0;
              let sentPush = 0;
              let bounced = 0;
              for (let notificationobj of donors) {
                let pushToken = notificationobj.notification;
                if (
                  (await notificationService.isValidToken(pushToken)) === false
                ) {
                  console.warn(
                    `${notificationobj.phone}: Push token is not valid. Falling back to SMS.`,
                  );
                  let sendSMS = await smsService
                    .send(
                      notificationobj.phone,
                      `${bankName[0].name} requires ${units} unit${
                        units == 1 ? '' : 's'
                      } of ${type} blood. Please contact ${contact} if you can donate.`,
                    )
                    .then((res) => {
                      sentSMS = sentSMS + 1;
                      ws.send(
                        `$ckpt%3%${JSON.stringify({
                          x: sentPush,
                          y: sentSMS,
                          e: bounced,
                        })}`,
                      );
                    })
                    .catch((err) => {
                      bounced = bounced + 1;
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
                sentPush = sentPush + 1;
              }
              let batchAndSend = await notificationService.batch(messages);
              ws.send(
                `$ckpt%3%${JSON.stringify({
                  x: sentPush,
                  y: sentSMS,
                  e: bounced,
                })}`,
              );
            }
          } else {
            ws.send(`%err%${auth.message}`);
          }
        } else {
          console.error('Invalid message received:', data);
        }
        console.log('Process completed.');
      } catch (error) {
        console.error('Invalid message received:', error);
      }
    });
  });
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
