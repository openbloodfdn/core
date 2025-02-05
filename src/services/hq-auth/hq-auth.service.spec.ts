import { Test, TestingModule } from '@nestjs/testing';
import { HqAuthService } from './hq-auth.service';

describe('HqAuthService', () => {
  let service: HqAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HqAuthService],
    }).compile();

    service = module.get<HqAuthService>(HqAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
