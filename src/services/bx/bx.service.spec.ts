import { Test, TestingModule } from '@nestjs/testing';
import { BxService } from './bx.service';

describe('BxService', () => {
  let service: BxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BxService],
    }).compile();

    service = module.get<BxService>(BxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
