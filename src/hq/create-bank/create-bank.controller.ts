import { Controller, Get } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { NeonService } from 'src/services/neon/neon.service';

/**
 * what this is:
 * this is a way I can create a bank in the database without having to write a SQL query
 * it's not included in the app.module.ts file, so it's not accessible from the app.
 * left it in so you could use it if needed. Make sure to include it in the app.module file and remove when done
 */
@Controller('hq/create-bank')
export class CreateBankController {
  constructor(private readonly neonService: NeonService) {}

  @Get()
  async createBank() {
    const secret = '';
    const bankName = '';
    const bankPhone = '';
    const bankID = '';
    const bankCoords = '';
    const bankRegion = '';

    interface BankDetails {
      secret: string;
      bankName: string;
      bankPhone: string;
      bankID: string;
      bankCoords: string;
      bankRegion: string;
    }

    bcrypt.hash(secret, 10, (err: Error | undefined, hash: string) => {
      if (err) {
        console.log(err);
        return;
      }
      this.neonService
        .query(
          `INSERT INTO banks (name, phone, uuid, secret, coords, region) VALUES ('${bankName}', '${bankPhone}', '${bankID}', '${hash}', '${bankCoords}', '${bankRegion}');`,
        )
        .then(() => {
          console.log('Bank created');
          return { error: false, message: 'Bank created' };
        })
        .catch((err: Error) => {
          console.log(err);
          return { error: true, message: 'Error creating bank' };
        });
    });
  }
}
