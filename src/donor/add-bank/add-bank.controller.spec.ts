import { Test, TestingModule } from '@nestjs/testing';
import { AddBankController } from './add-bank.controller';

describe('AddBankController', () => {
  let controller: AddBankController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddBankController],
      providers: [],
    }).compile();

    controller = module.get<AddBankController>(AddBankController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
