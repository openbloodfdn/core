/*import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class NeonService {
  constructor(@Inject('POSTGRES_POOL') private readonly sql: any) {}

  async query(query: string): Promise<any[]> {
    return await this.sql(query);
  }
}*/
import { Injectable } from '@nestjs/common';
import { createClient } from '@libsql/client';

interface Converter {
  convert: (value: any) => any;
  default: any;
}

@Injectable()
export class NeonService {
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
      convert: (val: number) => val == 1,
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
    scope: {
      convert: (val: string) => {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      },
      default: [],
    },
    installed: {
      convert: (val: number) => val == 1,
      default: false,
    },
    coords: {
      convert: (val: string) => val,
      default: '',
    },
  };

  fix(obj: any) {
    const result = { ...obj };

    // For every key defined in the converters, override the value
    // with a converted value or a default if it's missing.
    for (const key in result) {
      if (key in this.converters) {
        const converter = this.converters[key];
        result[key] = converter.convert(result[key] || converter.default);
      }
    }

    return result;
  }
  async query(query: string) {
    if (query.split(';').length > 2) {
      return { error: true, message: 'Only one query is allowed' };
    } else {
      console.debug(query);
      const result = await this.db.execute(query);
      result.rows.forEach((element: any, index: number) => {
        result.rows[index] = this.fix(element);
      });
      //console.debug(result.rows)
      return result.rows;
    }
  }
  //db.execute({ sql: prompt, args: params })

  async execute(query: string, params: any[]) {
    if (query.split(';').length > 2) {
      return { error: true, message: 'Only one query is allowed' };
    } else {
      const result = await this.db.execute({ sql: query, args: params });
      result.rows.forEach((element: any, index: number) => {
        result.rows[index] = this.fix(element);
      });
      return result.rows;
    }
  }
}
