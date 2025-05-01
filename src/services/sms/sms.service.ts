import { Injectable } from '@nestjs/common';
import * as querystring from 'querystring';
//import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';
const baseUrl = 'https://mediaapi.smsgupshup.com/GatewayAPI/rest';
@Injectable()
export class SMSService {
  constructor(private configService: ConfigService) {}

  getUserID(): string {
    return this.configService.get<string>('smsUserID') ?? '';
  }

  getPassword(): string {
    return this.configService.get<string>('smsUserPassword') ?? '';
  }

  getInReview(): string {
    return this.configService.get<string>('inReview') ?? '';
  }

  getReviewNumbers(): string {
    return this.configService.get<string>('reviewNumbers') ?? '';
  }

  async optIn(phone: string) {
    console.debug(`optIn called with phone: ${phone}`);
    try {
      const number = normalizeToE164(phone);
      console.debug(`Normalized phone number: ${number}`);

      if (this.getInReview() === 'true' && !this.isAllowedInReview(number)) {
        console.log(`Review Mode: Opt-in for ${phone} blocked`);
        return {
          error: true,
          message: 'Opt-in not allowed because app is in review mode',
        };
      }

      const url = `https://mediaapi.smsgupshup.com/GatewayAPI/rest?method=OPT_IN&format=json&userid=${this.getUserID()}&password=${this.getPassword()}&phone_number=${number}&v=1.1&auth_scheme=plain&channel=WHATSAPP`;
      console.debug(`Opt-in URL: ${url}`);

      const response = await fetch(url, { method: 'GET' });
      console.debug(`Fetch response: ${response}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.response.status !== 'success') {
        throw new Error(`Opt-in failed: ${data.response.message}`);
      }
      console.debug(`Opt-in response data: ${JSON.stringify(data)}`);
      return data;
    } catch (err) {
      console.error(`Failed to opt in ${phone}:`, err.message);
      throw err;
    }
  }

  async sendOTP(phone: string, otp: number) {
    console.debug(`sendOTP called with phone: ${phone}, otp: ${otp}`);
    try {
      const number = normalizeToE164(phone);
      console.debug(`Normalized phone number: ${number}`);

      if (this.getInReview() === 'true' && !this.isAllowedInReview(number)) {
        console.log(`Review Mode: OTP to ${phone} blocked`);
        return {
          error: true,
          message: 'OTP not sent because app is in review mode',
        };
      }

      const url = `https://mediaapi.smsgupshup.com/GatewayAPI/rest?userid=${this.getUserID()}&password=${this.getPassword()}&send_to=${number}&v=1.1&format=json&msg_type=TEXT&method=SENDMESSAGE&msg=${otp}+is+your+verification+code.+For+your+security%2C+do+not+share+this+code.&isTemplate=true`;
      console.debug(`Send OTP URL: ${url}`);

      const response = await fetch(url, { method: 'GET' });
      console.debug(`Fetch response: ${response}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.response.status !== 'success') {
        throw new Error(`Opt-in failed: ${data.response.message}`);
      }
      console.debug(`Send OTP response data: ${JSON.stringify(data)}`);
      return data;
    } catch (err) {
      console.error(`Failed to send OTP to ${phone}:`, err.message);
      throw err;
    }
  }

  async sendOTPAutoOptIn(phone: string, otp: number) {
    console.debug(`sendOTPAutoOptIn called with phone: ${phone}, otp: ${otp}`);
    try {
      console.debug(`Calling optIn for phone: ${phone}`);
      await this.optIn(phone);
      console.debug(`Calling sendOTP for phone: ${phone}`);
      return await this.sendOTP(phone, otp);
    } catch (err) {
      console.error(
        `Failed to send auto opt-in and OTP to ${phone}:`,
        err.message,
      );
      throw err;
    }
  }

  async sendMessage(o: { phone: string; message: string; footer?: string }) {
    console.debug(
      `sendMessage called with phone: ${o.phone}, message: ${o.message}`,
    );
    try {
      const url = formatMessageRequest(
        this.getUserID(),
        this.getPassword(),
        {
          target: o.phone,
          msg: o.message,
          footer: o.footer,
        },
        this.getInReview() == 'true',
        this.getReviewNumbers(),
      );
      console.debug(`Send Message URL: ${url}`);

      const response = await fetch(url, { method: 'GET' });
      console.debug(`Fetch response: ${response}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.response.status !== 'success') {
        throw new Error(`Opt-in failed: ${data.response.message}`);
      }
      console.debug(`Send Message response data: ${JSON.stringify(data)}`);
      return data;
    } catch (err) {
      console.error(`Failed to send SMS to ${o.phone}:`, err.message);
      throw err;
    }
  }

  private isAllowedInReview(phone: string): boolean {
    console.debug(`isAllowedInReview called with phone: ${phone}`);
    const allowedNumbers = this.getReviewNumbers().split(',') || [];
    const isAllowed = allowedNumbers.includes(phone);
    console.debug(`Is phone allowed in review: ${isAllowed}`);
    return isAllowed;
  }
}

function normalizeToE164(rawNumber: string): string {
  console.debug(`normalizeToE164 number: ${rawNumber}`);
  let digits = rawNumber.replace(/[^\d]/g, '');

  if (digits.length === 10) {
    digits = '91' + digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = '91' + digits.slice(1);
  }

  if (!/^\d{11,15}$/.test(digits)) {
    console.warn(`Invalid phone number format: ${digits}`);
    return '';
  }

  console.debug(`Normalized number: ${digits}`);
  return digits;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  console.debug(`chunkArray called with arr: ${arr}, size: ${size}`);
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  console.debug(`Chunks created: ${JSON.stringify(chunks)}`);
  return chunks;
}

function gupshupQueryEncode(obj: Record<string, any>): string {
  return Object.entries(obj)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)
          .replace(/%20/g, '+')
          .replace(/%0A/g, '%0A') // explicit for clarity
          .replace(/%2A/g, '*')
          .replace(/%7E/g, '~')}`,
    )
    .join('&');
}

function formatMessageRequest(
  userid: string,
  password: string,
  object: {
    target: string;
    msg: string;
    footer?: string;
  },
  inReview: boolean = false,
  reviewNumbers: string = '',
) {
  // Split the target string and filter out empty values
  let phones = object.target
    .split(',')
    .map((phone) => phone.trim()) // Remove extra spaces
    .filter((phone) => phone !== ''); // Filter out empty strings

  console.debug(`Filtered phones: ${phones}`);

  // Normalize phone numbers
  phones = phones
    .map((phone) => normalizeToE164(phone))
    .filter((phone) => phone !== '');

  console.debug(`Normalized phones: ${phones}`);

  if (inReview) {
    console.debug(`In review mode: ${inReview}`);
    console.debug(`Review numbers: ${reviewNumbers}`);
    const allowed = reviewNumbers
      .split(',')
      .map((p) => normalizeToE164(p.trim()))
      .filter((p) => p !== '');
    phones = phones.filter((phone) => allowed.includes(phone));
    console.debug(`Allowed phones in review: ${phones}`);
  }

  if (phones.length === 0) throw new Error('No valid phone numbers provided');
  if (phones.length > 6)
    throw new Error('Too many phone numbers provided. Please batch.');

  const obj: Record<string, any> = {
    userid,
    password,
    send_to: phones.join(','),
    v: '1.1',
    format: 'json',
    msg_type: 'TEXT',
    method: 'SENDMESSAGE',
    msg: object.msg,
    isTemplate: true,
  };

  if (object.footer) obj.footer = object.footer;
  console.log(baseUrl, '?', obj);
  return `${baseUrl}?${gupshupQueryEncode(obj)}`;
}
