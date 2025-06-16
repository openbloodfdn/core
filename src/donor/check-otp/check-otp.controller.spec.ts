import { Test, TestingModule } from '@nestjs/testing';
import { CheckOtpController } from './check-otp.controller';

describe('CheckOtpController', () => {
  let controller: CheckOtpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckOtpController],
      providers: [],
    }).compile();

    controller = module.get<CheckOtpController>(CheckOtpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
