import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { HqAuthService } from 'src/services/hq-auth/hq-auth.service';
import { NeonService } from 'src/services/neon/neon.service';

@Controller('hq/query-donor')
export class QueryDonorController {
  constructor(
    private readonly neonService: NeonService,
    private readonly hqAuthService: HqAuthService,
  ) {}
  /**
   * @params {string} token
   * @params {number} months
   * @params {boolean} verified
   * @params {string} bloodtype
   * @params {number} distance
   * @params {boolean} affiliated
   * @params {boolean} unverified
   * @params {string} name
   */
  @Post()
  async queryDonor(
    @Body()
    request: {
      bankCode: string;
      token: string;
      months: number;
      verified: boolean;
      bloodtype: string;
      distance: number;
      unverified: boolean;
      name: string;
    },
  ) {
    let { bankCode, token, months, verified, bloodtype, distance, name } =
      request;
    let initialTimestamp = new Date();
    let auth = await this.hqAuthService.authenticate(bankCode, token);
    if (auth.error === false) {
      if (request.unverified === true) {
        let queryString = `SELECT name,uuid,verified,bloodtype,distance,phone,lastdonated,totaldonated,dob,sex FROM users where verified=0`;
        let users = await this.neonService.query(queryString);
        let finalTimestamp = new Date();
        let elapsed = finalTimestamp.getTime() - initialTimestamp.getTime();
        return {
          data: users,
          time: isNaN(elapsed) ? 0 : elapsed,
        };
      }
      let whereHasBeenUsed = false;
      let queryString = `SELECT name,uuid,verified,bloodtype,distance,phone,lastdonated,totaldonated,dob,sex FROM users ${
        verified == true ? 'WHERE verified = 1 ' : ''
      }`; /*${
        affiliated
          ? `${verified === true ? 'AND' : 'WHERE'} affiliated = true`
          : ''
      }`;*/
      if (months != null) {
        let date = new Date();
        date.setMonth(date.getMonth() - months);
        queryString += ` ${
          verified === true || whereHasBeenUsed ? 'AND' : 'WHERE'
        } (lastdonated < '${date.toISOString()}' OR lastdonated IS NULL)`;

        if (verified === false) {
          whereHasBeenUsed = true;
        }
      }

      if (distance != null) {
        queryString += ` ${
          verified === true || whereHasBeenUsed === true ? 'AND' : 'WHERE'
        } distance < ${distance}`;

        if (verified === false) {
          whereHasBeenUsed = true;
        }
      }

      if (bloodtype?.trim() !== '') {
        queryString += ` ${
          verified === true || whereHasBeenUsed === true ? 'AND' : 'WHERE'
        } bloodtype = '${bloodtype}'`;

        if (verified === false) {
          whereHasBeenUsed = true;
        }
      }
      if (name?.trim() !== '') {
        queryString += ` ${
          verified === true || whereHasBeenUsed === true ? 'AND' : 'WHERE'
        } name LIKE '%${name}%' COLLATE NOCASE OR phone LIKE '%${name}%' COLLATE NOCASE`;

        if (verified === false) {
          whereHasBeenUsed = true;
        }
      }
      queryString += ` ${
        verified === true || whereHasBeenUsed === true ? 'AND' : 'WHERE'
      } scope LIKE '%"${bankCode}"%' ORDER BY distance ASC;`;
      console.log(queryString);

      let users = await this.neonService.query(queryString);
      let finalTimestamp = new Date();
      console.log(
        `Query took ${finalTimestamp.getTime() - initialTimestamp.getTime()}ms`,
      );
      let timetaken = finalTimestamp.getTime() - initialTimestamp.getTime();
      return { data: users, time: isNaN(timetaken) ? 0 : timetaken };
    } else {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }
}
