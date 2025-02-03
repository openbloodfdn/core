import { Test, TestingModule } from '@nestjs/testing';
import { UpdateLocationController } from './update-location.controller';

describe('UpdateLocationController', () => {
  let controller: UpdateLocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateLocationController],
      providers: [],
    }).compile();

    controller = module.get<UpdateLocationController>(UpdateLocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
