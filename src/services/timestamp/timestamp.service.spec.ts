import { Test, TestingModule } from '@nestjs/testing';
import { TimestampService } from './timestamp.service';

describe('TimestampService', () => {
  let service: TimestampService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimestampService],
    }).compile();

    service = module.get<TimestampService>(TimestampService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
