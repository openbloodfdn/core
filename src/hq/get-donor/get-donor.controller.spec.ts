import { Test, TestingModule } from '@nestjs/testing';
import { GetDonorController } from './get-donor.controller';

describe('GetDonorController', () => {
  let controller: GetDonorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetDonorController],
      providers: [],
    }).compile();

    controller = module.get<GetDonorController>(GetDonorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
