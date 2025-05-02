import { Controller, Get } from '@nestjs/common';
import { EmailService } from 'src/services/email/email.service';
import { NeonService } from 'src/services/neon/neon.service';
@Controller('admin/smsreport')
export class SmsreportController {
  constructor(
    private readonly emailService: EmailService,
    private readonly neonService: NeonService,
  ) {}

  @Get()
  async getSmsReport() {
    let smsReport = await this.neonService.query(
      `SELECT value FROM admin where key='sms';`,
    );
    let formattedDate = formatDate(new Date());
    if (smsReport.length !== 0 && parseInt(smsReport[0].value) != 0) {
      console.log(`${smsReport[0].value} SMS sent today, ${formattedDate}`);
      await this.emailService.send(
        `${smsReport[0].value} SMS sent today, ${formattedDate}`,
        `yas. ty - open blood`,
      );
    }
    await this.neonService.query(`UPDATE admin SET value=0 WHERE key='sms';`);
    return {
      error: false,
      message: 'SMS report sent',
    };
  }
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = String(date.getFullYear()).slice(-2); // Get last 2 digits

  return `${day}/${month}/${year}`;
}
