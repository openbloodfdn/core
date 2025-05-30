import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/services/auth/auth.guard';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('donor/remove-bank')
export class RemoveBankController {
  constructor(private readonly neonService: NeonService) {}
  @UseGuards(AuthGuard)
  @Post()
  async removeBank(@Body() body: { uuid: string; bankcode: string }) {
    let { uuid, bankcode } = body;
    if (!uuid) {
      return { error: true, message: 'User not found' };
    } else {
      let getUserFromToken = await this.neonService.query(
        `SELECT scope,verified FROM users WHERE uuid='${uuid}';`,
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
        await this.neonService.query(
          `UPDATE banks SET total = total - 1 WHERE uuid = '${bankcode}';`,
        );
        if (getUserFromToken[0].verified === true) {
          await this.neonService.query(
            `UPDATE banks SET verified = verified - 1 WHERE uuid = '${bankcode}';`,
          );
        }
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
