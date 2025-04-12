import { Body, Controller, Post } from '@nestjs/common';
import { DBService } from 'src/services/db/db.service';
import { TimestampService } from 'src/services/timestamp/timestamp.service';
import { NeonService } from 'src/services/neon/neon.service';
import * as shortid from 'shortid';
@Controller('donor/regenerate-id')
export class RegenerateIdController {
  constructor(
    private readonly neonService: NeonService,
  ) {}

  @Post()
  async getBanks(@Body() body: { uuid: string }) {
    let { uuid } = body;
    if (!uuid) {
      return { error: true, message: 'User not found' };
    } else {
      let getUserFromToken = await this.neonService.query(
        `SELECT phone,uuid FROM users WHERE uuid='${uuid}';`,
      );
      if (getUserFromToken.length > 0) {
        let updateUserID = await this.neonService.query(
          `UPDATE users set uuid = '${shortid.generate()}' WHERE uuid='${uuid}' returning uuid;`,
        );
        return {
          error: false,
          message: 'ID regenerated',
          uuid: updateUserID[0].uuid,
        };
      } else {
        return { error: true, message: 'User not found' };
      }
    }
  }
}
