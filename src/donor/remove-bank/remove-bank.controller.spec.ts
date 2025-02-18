import { Test, TestingModule } from '@nestjs/testing';
import { RemoveBankController } from './remove-bank.controller';

describe('RemoveBankController', () => {
  let controller: RemoveBankController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemoveBankController],
      providers: [],
    }).compile();

    controller = module.get<RemoveBankController>(RemoveBankController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
