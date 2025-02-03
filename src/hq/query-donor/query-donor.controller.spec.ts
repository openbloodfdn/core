import { Test, TestingModule } from '@nestjs/testing';
import { QueryDonorController } from './query-donor.controller';

describe('QueryDonorController', () => {
  let controller: QueryDonorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueryDonorController],
      providers: [],
    }).compile();

    controller = module.get<QueryDonorController>(QueryDonorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
