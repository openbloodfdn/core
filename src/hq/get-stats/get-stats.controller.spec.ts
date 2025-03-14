import { Test, TestingModule } from '@nestjs/testing';
import { GetStatsController } from './get-stats.controller';

describe('GetStatsController', () => {
  let controller: GetStatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetStatsController],
      providers: [],
    }).compile();

    controller = module.get<GetStatsController>(GetStatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
