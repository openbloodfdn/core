import { Test, TestingModule } from '@nestjs/testing';
import { VerifyDonorController } from './verify-donor.controller';

describe('VerifyDonorController', () => {
  let controller: VerifyDonorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerifyDonorController],
      providers: [],
    }).compile();

    controller = module.get<VerifyDonorController>(VerifyDonorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
