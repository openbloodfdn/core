import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Initialize the transporter in the constructor
    this.transporter = nodemailer.createTransport({
      service: 'iCloud',
      auth: {
        user: this.getEmailUser(),
        pass: this.getEmailPassword(),
      },
    });
  }

  getEmailUser(): string {
    return this.configService.get<string>('EMAIL_USER') ?? '';
  }

  getEmailPassword(): string {
    return this.configService.get<string>('EMAIL_PASSWORD') ?? '';
  }

  getEmailFrom(): string {
    return this.configService.get<string>('EMAIL_FROM') ?? '';
  }
  getEmailTo(): string {
    return this.configService.get<string>('EMAIL_TO') ?? '';
  }

  async send(subject: string, body: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.getEmailFrom(),
        to: this.getEmailTo(),
        subject,
        text: body,
      });
      console.log('Email sent: %s', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
