import { Test, TestingModule } from '@nestjs/testing';
import { ExtendDonorScopeController } from './extend-donor-scope.controller';

describe('ExtendDonorScopeController', () => {
  let controller: ExtendDonorScopeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtendDonorScopeController],
      providers: [],
    }).compile();

    controller = module.get<ExtendDonorScopeController>(ExtendDonorScopeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
