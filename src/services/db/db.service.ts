import { Injectable } from '@nestjs/common';
import { createClient } from '@libsql/client';

interface Converter {
  convert: (value: any) => any;
  default: any;
}

@Injectable()
export class DBService {
  private db;

  constructor() {
    this.db = createClient({
      url: process.env.TURSO_DB_URL || '',
      authToken: process.env.TURSO_DB_TOKEN,
    });
  }
  private readonly converters: { [key: string]: Converter } = {
    id: {
      convert: (val: any) => parseInt(val),
      default: null,
    },
    name: {
      convert: (val: any) => val,
      default: '',
    },
    phone: {
      convert: (val: string) => val,
      default: '',
    },
    bloodtype: {
      convert: (val: string) => val,
      default: '',
    },
    uuid: {
      convert: (val: string) => val,
      default: '',
    },
    lastdonated: {
      convert: (val: string) => val,
      default: '',
    },
    sms: {
      convert: (val: string) => val == 'true',
      default: false,
    },
    notification: {
      convert: (val: string) => val,
      default: '',
    },
    totaldonated: {
      convert: (val: string) => parseInt(val, 10),
      default: 0,
    },
    weight: {
      convert: (val: string) => parseInt(val),
      default: 0,
    },
    height: {
      convert: (val: string) => parseInt(val),
      default: 0,
    },
    created_on: {
      convert: (val: string) => val,
      default: '',
    },
    verified: {
      convert: (val: string) => val == 'true',
      default: false,
    },
    log: {
      convert: (val: string) => {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      },
      default: [],
    },
    otp: {
      convert: (val: string) => parseInt(val),
      default: null,
    },
    //TODO: remove these two
    affiliated: {
      convert: (val: string) => val == 'true',
      default: false,
    },
    affiliatedata: {
      convert: (val: string) => val,
      default: '',
    },

    sex: {
      convert: (val: string) => val,
      default: '',
    },
    dob: {
      convert: (val: string) => val,
      default: '',
    },
    conditions: {
      convert: (val: string) => val,
      default: '',
    },
    medications: {
      convert: (val: string) => val,
      default: '',
    },
    distance: {
      convert: (val: string) => parseFloat(val),
      default: 0,
    },
    birthdayhero: {
      convert: (val: string) => val == 'true',
      default: false,
    },
    installed: {
      convert: (val: string) => val == 'true',
      default: false,
    },
    coords: {
      convert: (val: string) => val,
      default: '',
    },
  };

  fix(obj: any) {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(this.converters, key)) {
        const { convert, default: defaultValue } = this.converters[key];
        result[key] = obj[key] !== undefined ? convert(obj[key]) : defaultValue;
      }
    }
    return result;
  }
  async query(query: string) {
    if (query.split(';').length > 2) {
      return { error: true, message: 'Only one query is allowed' };
    } else {
      const result = await this.db.execute(query);
      result.rows.forEach((element: any, index: number) => {
        result.rows[index] = this.fix(element);
      });
      return result.rows;
    }
  }
}
