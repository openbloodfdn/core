import { Test, TestingModule } from '@nestjs/testing';
import { NeonService } from './neon.service';

describe('NeonService', () => {
  let service: NeonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NeonService],
    }).compile();

    service = module.get<NeonService>(NeonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
