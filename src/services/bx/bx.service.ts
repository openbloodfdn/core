import { Injectable } from '@nestjs/common';
import { Server } from 'ws';
import { ExpoPushMessage } from 'expo-server-sdk';
import { NeonService } from '../neon/neon.service';
import { NotificationService } from '../notification/notification.service';
import { SMSService } from '../sms/sms.service';
import { HqAuthService } from '../hq-auth/hq-auth.service';

@Injectable()
export class BxService {
  private wss: Server;

  constructor(
    private readonly neonService: NeonService,
    private readonly notificationService: NotificationService,
    private readonly smsService: SMSService,
    private readonly hqAuthService: HqAuthService,
  ) {}

  initWebSocketServer(server: any) {
    this.wss = new Server({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
      if (request.url === '/bx/old') {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    this.wss.on('connection', (ws) => {
      console.log('Client connected to WebSocket');
      this.handleMessages(ws);
    });
  }

  private async handleMessages(ws: any) {
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data.bankCode);

        // Check if data contains all required fields
        if (this.validateData(data)) {
          await this.processRequest(ws, data);
        } else {
          console.error('Invalid message received:', data);
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });
  }

  private validateData(data: any): boolean {
    return (
      data.bankCode &&
      data.token &&
      data.type &&
      data.units &&
      data.months &&
      data.contact
    );
  }

  private async processRequest(ws: any, data: any) {
    let { bankCode, token, type, units, months, contact } = data;
    let auth = await this.hqAuthService.authenticate(bankCode, token);

    if (auth.error === false) {
      ws.send(`%ckpt%0%${JSON.stringify({ a: 1 })}`);

      let now = new Date();
      let minimumDate = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
      let prompt = `SELECT name,notification,phone FROM users WHERE phone='9500499912';`;
      let donors = await this.neonService.query(prompt);

      ws.send(`%ckpt%1%${JSON.stringify({ x: prompt.length })}`);
      
      let bankName = await this.neonService.query(
        `SELECT name FROM banks WHERE uuid = '${bankCode}';`,
      );

      if (donors.length === 0) {
        ws.send(`%err%No donors found in your scope.`);
      } else {
        await this.sendNotifications(ws, donors, bankName, units, type, contact);
      }
    } else {
      ws.send(`%err%${auth.message}`);
    }
  }

  private async sendNotifications(ws: any, donors: any[], bankName: any, units: number, type: string, contact: string) {
    let messages: ExpoPushMessage[] = [];
    let sentSMS = 0;
    let sentPush = 0;
    let bounced = 0;

    for (let donor of donors) {
      let pushToken = donor.notification;
      if (!(await this.notificationService.isValidToken(pushToken))) {
        console.warn(`${donor.phone}: Push token is not valid. Falling back to SMS.`);
        await this.sendSMS(donor, bankName, units, type, contact);
        sentSMS++;
      } else {
        messages.push(this.createPushMessage(donor, units, type, contact));
        sentPush++;
      }

      ws.send(
        `%ckpt%3%${JSON.stringify({ x: sentPush, y: sentSMS, e: bounced })}`,
      );
    }

    await this.notificationService.batch(messages);
    ws.send(
      `%ckpt%3%${JSON.stringify({ x: sentPush, y: sentSMS, e: bounced })}`,
    );
  }

  private async sendSMS(donor: any, bankName: any, units: number, type: string, contact: string) {
    try {
      await this.smsService.send(
        donor.phone,
        `${bankName[0].name} requires ${units} unit${units == 1 ? '' : 's'} of ${type} blood. Please contact ${contact} if you can donate.`,
      );
    } catch (err) {
      console.warn('Error sending SMS:', err);
    }
  }

  private createPushMessage(donor: any, units: number, type: string, contact: string): ExpoPushMessage {
    return {
      to: donor.notification,
      title: `Blood Center requires ${units} unit${units == 1 ? '' : 's'} of ${type} blood.`,
      body: 'Please donate if you can. Click to call.',
      priority: 'high',
      data: { url: `tel:+91${contact}` },
      sound: { critical: true, name: 'default', volume: 1 },
      interruptionLevel: 'critical',
    };
  }
}
