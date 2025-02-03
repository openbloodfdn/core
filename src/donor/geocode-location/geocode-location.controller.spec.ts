import { Test, TestingModule } from '@nestjs/testing';
import { GeocodeLocationController } from './geocode-location.controller';

describe('GeocodeLocationController', () => {
  let controller: GeocodeLocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeocodeLocationController],
      providers: [],
    }).compile();

    controller = module.get<GeocodeLocationController>(GeocodeLocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
