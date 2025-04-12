import { Test, TestingModule } from '@nestjs/testing';
import { RegenerateIdController } from './regenerate-id.controller';

describe('RegenerateIdController', () => {
  let controller: RegenerateIdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegenerateIdController],
      providers: [],
    }).compile();

    controller = module.get<RegenerateIdController>(RegenerateIdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
