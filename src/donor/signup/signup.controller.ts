import { Body, Controller, Post } from '@nestjs/common';
import * as shortid from 'shortid';
import { AuthService } from 'src/services/auth/auth.service';
import { EmailService } from 'src/services/email/email.service';
import { NeonService } from 'src/services/neon/neon.service';
@Controller('donor/signup')
export class SignupController {
  constructor(
    private readonly neonService: NeonService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService
  ) {}

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
      dob: string;
      birthdayhero: boolean;
      distance: number;
      sex: string;
      medications: string;
      conditions: string;
      coords: string;
      scope: string;
      os: string;
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
25  coords TEXT
26  scope TEXT[]
27  os TEXT
);
 */

      const prompt = `
  INSERT INTO users (
    name, phone, uuid, bloodtype, lastdonated, sms, totaldonated,
    weight, height, dob, verified, otp, birthdayhero, distance,
    sex, medications, conditions, installed, coords, log, scope, os
  ) VALUES (
    ?, ?, ?, ?, NULL, true, ?, ?, ?, ?, 0, null, ?, ?, ?, ?, ?, true, ?, '[]', ?, ?
  ) RETURNING name, phone, uuid;
`;

      const params = [
        request.name,
        request.phonenumber.toString().replace('+91', '').replace(/\s/g, ''),
        shortid.generate(),
        request.bloodtype,
        0,
        parseInt(request.weight),
        parseInt(request.height),
        request.dob,
        request.birthdayhero,
        request.distance,
        request.sex,
        request.medications,
        request.conditions,
        request.coords,
        `["${request.scope}"]`,
        request.os,
      ];
      console.log(params);
      const insertUser = await this.neonService.execute(prompt, params);

      const bankUpdate = await this.neonService.query(
        `UPDATE banks SET total = total + 1 WHERE uuid = '${request.scope}' returning name;`,
      );
      // result.rows[0] contains your returned values
      await this.neonService.query(
        `DELETE from localups WHERE uuid='${request.phonenumber}';`,
      );
      console.log(insertUser);
      this.emailService.send(
        `Signup! ${insertUser[0].name} <${request.phonenumber}>`,
        `New signup for ${request.scope}! thank you ${insertUser[0].name}, very cool`,
      )
      return {
        error: false,
        message: 'Account created!',
        access: {
          token: await this.authService.sign(
            {
              sub: insertUser[0].uuid,
              intent: 'n',
            },
            {
              expiresIn: '1h',
            },
          ),
          exp: Math.floor(Date.now() / 1000) + 60 * 60,
        },
        refresh: {
          token: await this.authService.sign(
            {
              sub: insertUser[0].uuid,
              intent: 'r',
            },
            {
              expiresIn: '14d',
            },
          ),
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14,
        },
        data: {
          phone: insertUser[0].phone,
          name: insertUser[0].name,
          bankName: bankUpdate[0].name,
        },
      };
    }
  }
}
