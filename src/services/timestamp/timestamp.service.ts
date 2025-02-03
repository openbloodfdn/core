import { Injectable } from '@nestjs/common';

@Injectable()
export class TimestampService {
  toShortString(timestamp: string) {
    if (!timestamp?.toString().trim()) {
      return 'Never';
    }
    let date = new Date(timestamp);
    let month = date.toLocaleString('default', { month: 'short' });
    let year = date.getFullYear().toString().substring(2);
    return `${month} '${year}`;
  }
}
