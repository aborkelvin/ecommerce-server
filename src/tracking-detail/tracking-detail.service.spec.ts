import { Test, TestingModule } from '@nestjs/testing';
import { TrackingDetailService } from './tracking-detail.service';

describe('TrackingDetailService', () => {
  let service: TrackingDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingDetailService],
    }).compile();

    service = module.get<TrackingDetailService>(TrackingDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
