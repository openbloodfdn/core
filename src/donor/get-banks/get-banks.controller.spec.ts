import { Test, TestingModule } from '@nestjs/testing';
import { GetBanksController } from './get-banks.controller';

describe('GetBanksController', () => {
  let controller: GetBanksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetBanksController],
      providers: [],
    }).compile();

    controller = module.get<GetBanksController>(GetBanksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
