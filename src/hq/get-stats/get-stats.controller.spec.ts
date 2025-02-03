import { Test, TestingModule } from '@nestjs/testing';
import { GetStatsController } from './get-stats.controller';
import { GetStatsService } from './get-stats.service';

describe('GetStatsController', () => {
  let controller: GetStatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetStatsController],
      providers: [GetStatsService],
    }).compile();

    controller = module.get<GetStatsController>(GetStatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
