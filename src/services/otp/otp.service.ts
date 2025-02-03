import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class OTPService {
  private client: Twilio;

  constructor() {
    this.client = new Twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  async send(phone: string, otp: number) {
    console.log('OTPService', phone, otp);
    // sanitize phone
    phone = phone.replace(/\s/g, '').replace('+91', '');
    const response = await this.client.messages.create({
      body: `Thank you for signing up! Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`,
    });
    return response;
  }
}
