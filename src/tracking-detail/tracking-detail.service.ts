import { Injectable } from '@nestjs/common';
import { CreateTrackingDetailDto } from './dto/create-tracking-detail.dto';
import { UpdateTrackingDetailDto } from './dto/update-tracking-detail.dto';

@Injectable()
export class TrackingDetailService {
  create(createTrackingDetailDto: CreateTrackingDetailDto) {
    return 'This action adds a new trackingDetail';
  }

  findAll() {
    return `This action returns all trackingDetail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} trackingDetail`;
  }

  update(id: number, updateTrackingDetailDto: UpdateTrackingDetailDto) {
    return `This action updates a #${id} trackingDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} trackingDetail`;
  }
}
