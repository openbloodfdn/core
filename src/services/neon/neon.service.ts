import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class NeonService {
  constructor(@Inject('POSTGRES_POOL') private readonly sql: any) {}

  async query(query: string): Promise<any[]> {
    return await this.sql(query);
  }
}