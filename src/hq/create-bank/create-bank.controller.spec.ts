import { Test, TestingModule } from '@nestjs/testing';
import { CreateBankController } from './create-bank.controller';

describe('CreateBankController', () => {
  let controller: CreateBankController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateBankController],
      providers: [],
    }).compile();

    controller = module.get<CreateBankController>(CreateBankController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
