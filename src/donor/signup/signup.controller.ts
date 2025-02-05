import { Body, Controller, Post } from '@nestjs/common';
import * as shortid from 'shortid';
import { NeonService } from 'src/services/neon/neon.service';
@Controller('donor/signup')
export class SignupController {
  constructor(private readonly neonService: NeonService) {}

  @Post()
  async signup(
    @Body()
    request: {
      phonenumber: string;
      name: string;
      weight: string;
      height: string;
      age: string;
      bloodtype: string;
      lookupid: string;
      dob: string;
      birthdayhero: boolean;
      distance: number;
      sex: string;
      medications: string;
      conditions: string;
      coords: string;
      scope: string;
    },
  ) {
    let getUserFromUsername = await this.neonService.query(
      `SELECT uuid FROM users WHERE phone='${request.phonenumber.toString()}';`,
    );
    console.log(getUserFromUsername);
    if (getUserFromUsername.length > 0) {
      return { error: true, message: 'User already exists' };
    } else {
      /*
1   birthdayhero	boolean
2	  verified	boolean [DONE]
3	  log	ARRAY [DONE]
4	  otp	integer [DONE]
7	  dob	TIMESTAMPTZ [DONE]
8	  distance	numeric
9	  id integer [DONE]
10	lastdonated	TIMESTAMPTZ [DONE]
11	sms	boolean [DONE]
12	totaldonated	numeric [DONE]
13	weight	numeric [DONE]
14	height	numeric [DONE]
15	created_on	TIMESTAMPTZ [DONE]
16	name	TEXT [DONE]
17	phone	TEXT [DONE]
18	bloodtype	TEXT [DONE]
19	uuid	TEXT [DONE]
20	sex	VARCHAR
21	medications	TEXT[]
22	notification	TEXT
23	conditions	TEXT
24  installed BOOLEAN
);
 */
      let prompt = `INSERT INTO users (name, phone, uuid, bloodtype, lastdonated, sms, totaldonated, weight, height, dob, verified, otp, birthdayhero, distance, sex, medications, conditions, installed, coords, log, scope) VALUES ('${
        request.name
      }' , '${request.phonenumber
        .toString()
        .replace('+91', '')
        .replace(/\s/g, '')}', '${shortid.generate()}', '${
        request.bloodtype
      }', NULL, true, ${0}, ${parseInt(request.weight)}, ${parseInt(
        request.height,
      )}, '${request.dob}', 0, null, ${request.birthdayhero}, ${request.distance}, '${
        request.sex
      }', '${request.medications}', '${request.conditions}', true, '${
        request.coords
      }', '[]', '["${request.scope}"]') returning name,phone,uuid;`;
      console.log(prompt);

      let insertUser = await this.neonService.query(prompt);

      if (request.lookupid !== '') {
        await this.neonService.query(
          `DELETE from localups WHERE uuid='${request.lookupid}';`,
        );
      }
      console.log(insertUser);
      return {
        error: false,
        message: 'Account created!',
        data: insertUser[0],
      };
    }
  }
}
