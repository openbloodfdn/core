import { Test, TestingModule } from '@nestjs/testing';
import { RequestBloodController } from './request-blood.controller';

describe('RequestBloodController', () => {
  let controller: RequestBloodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestBloodController],
      providers: [],
    }).compile();

    controller = module.get<RequestBloodController>(RequestBloodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
