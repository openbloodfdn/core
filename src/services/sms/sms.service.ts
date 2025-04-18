import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';
let inReview = process.env.inReview;
let reviewNumbers = process.env.reviewNumbers;

@Injectable()
export class SMSService {
  private client: Twilio;

  constructor() {
    this.client = new Twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  async send(phone: string, message: string) {
    if (inReview == 'true' && !reviewNumbers?.split(',').includes(phone)) {
      console.log(`Review Mode: SMS to ${phone} blocked`);
      return {
        error: true,
        message: 'SMS not sent because app is in review mode',
      };
    }
    // sanitize phone
    phone = phone.replace(/\s/g, '').replace('+91', '');
    const response = await this.client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`,
    });
    console.log(`SMS sent/sending to ${phone}`);
    return response;
  }
}
