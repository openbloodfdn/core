import { Body, Controller, Post } from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('donor/add-bank')
export class AddBankController {
  constructor(private readonly neonService: NeonService) {}

  @Post()
  async addBank(@Body() body: { uuid: string; bankcode: string }) {
    let { uuid, bankcode } = body;
    if (!uuid) {
      return { error: true, message: 'User not found' };
    } else {
      let getUserFromToken = await this.neonService.query(
        `SELECT scope,verified FROM users WHERE uuid='${uuid}';`,
      );
      let getBankData = await this.neonService.query(
        `SELECT uuid FROM banks WHERE uuid='${bankcode}';`,
      );
      if (getUserFromToken.length > 0 && getBankData.length > 0) {
        //add bank to user
        let localScope = getUserFromToken[0].scope;
        localScope.push(bankcode);
        console.log(JSON.stringify(localScope));
        await this.neonService.query(
          `UPDATE users SET scope = '${JSON.stringify(localScope)}' WHERE uuid='${uuid}';`,
        );
        await this.neonService.query(
          `UPDATE banks SET total = total + 1 WHERE uuid = '${bankcode}';`,
        );
        if (getUserFromToken[0].verified === true) {
          await this.neonService.query(
            `UPDATE banks SET verified = verified + 1 WHERE uuid = '${bankcode}';`,
          );
        }
        return {
          error: false,
          message: 'Bank added',
        };
      } else {
        return { error: true, message: 'User or bank not found' };
      }
    }
  }
}
