import { Test, TestingModule } from '@nestjs/testing';
import { UpdateNotificationsController } from './update-notifications.controller';

describe('UpdateNotificationsController', () => {
  let controller: UpdateNotificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateNotificationsController],
      providers: [],
    }).compile();

    controller = module.get<UpdateNotificationsController>(
      UpdateNotificationsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
