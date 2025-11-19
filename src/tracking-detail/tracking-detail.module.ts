import { Module } from '@nestjs/common';
import { TrackingDetailService } from './tracking-detail.service';
import { TrackingDetailController } from './tracking-detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingDetail } from './entities/tracking-detail.entity';

@Module({
  controllers: [TrackingDetailController],
  providers: [TrackingDetailService],
  imports: [
    TypeOrmModule.forFeature([TrackingDetail])
  ]
})
export class TrackingDetailModule {}
