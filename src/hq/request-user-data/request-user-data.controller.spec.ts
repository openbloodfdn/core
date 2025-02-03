import { Test, TestingModule } from '@nestjs/testing';
import { RequestUserDataController } from './request-user-data.controller';

describe('RequestUserDataController', () => {
  let controller: RequestUserDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestUserDataController],
      providers: [],
    }).compile();

    controller = module.get<RequestUserDataController>(
      RequestUserDataController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
