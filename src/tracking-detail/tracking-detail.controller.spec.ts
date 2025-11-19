import { Test, TestingModule } from '@nestjs/testing';
import { TrackingDetailController } from './tracking-detail.controller';
import { TrackingDetailService } from './tracking-detail.service';

describe('TrackingDetailController', () => {
  let controller: TrackingDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackingDetailController],
      providers: [TrackingDetailService],
    }).compile();

    controller = module.get<TrackingDetailController>(TrackingDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
