import { Test, TestingModule } from '@nestjs/testing';
import { QRController } from './qr.controller';

describe('RefreshController', () => {
  let controller: QRController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QRController],
      providers: [],
    }).compile();

    controller = module.get<QRController>(QRController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
