import { Body, Controller, Post } from '@nestjs/common';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('donor/remove-bank')
export class RemoveBankController {
  constructor(private readonly neonService: NeonService) {}

  @Post()
  async removeBank(@Body() body: { uuid: string; bankcode: string }) {
    let { uuid, bankcode } = body;
    if (!uuid) {
      return { error: true, message: 'User not found' };
    } else {
      let getUserFromToken = await this.neonService.query(
        `SELECT scope FROM users WHERE uuid='${uuid}';`,
      );
      if (getUserFromToken.length > 0) {
        //remove bank from user
        let localScope = getUserFromToken[0].scope;
        //delete localScope[localScope.indexOf(bankcode)];
        localScope = localScope.filter((s) => s !== bankcode);
        console.log(JSON.stringify(localScope));
        await this.neonService.query(
          `UPDATE users SET scope = '${JSON.stringify(localScope)}' WHERE uuid='${uuid}';`,
        );
        return {
          error: false,
          message: 'Bank removed',
        };
      } else {
        return { error: true, message: 'User not found' };
      }
    }
  }
}
