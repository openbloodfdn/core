import { Test, TestingModule } from '@nestjs/testing';
import { SmsreportController } from './smsreport.controller';
describe('SmsreportController', () => {
  let controller: SmsreportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmsreportController],
      providers: [],
    }).compile();

    controller = module.get<SmsreportController>(SmsreportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
