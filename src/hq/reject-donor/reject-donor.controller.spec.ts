import { Test, TestingModule } from '@nestjs/testing';
import { RejectDonorController } from './reject-donor.controller';

describe('RejectDonorController', () => {
  let controller: RejectDonorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RejectDonorController],
      providers: [],
    }).compile();

    controller = module.get<RejectDonorController>(RejectDonorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
