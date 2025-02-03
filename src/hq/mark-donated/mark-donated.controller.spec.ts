import { Test, TestingModule } from '@nestjs/testing';
import { MarkDonatedController } from './mark-donated.controller';

describe('MarkDonatedController', () => {
  let controller: MarkDonatedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarkDonatedController],
      providers: [],
    }).compile();

    controller = module.get<MarkDonatedController>(MarkDonatedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
