import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TrackingDetailService } from './tracking-detail.service';
import { CreateTrackingDetailDto } from './dto/create-tracking-detail.dto';
import { UpdateTrackingDetailDto } from './dto/update-tracking-detail.dto';

@Controller('tracking-detail')
export class TrackingDetailController {
  constructor(private readonly trackingDetailService: TrackingDetailService) {}

  @Post()
  create(@Body() createTrackingDetailDto: CreateTrackingDetailDto) {
    return this.trackingDetailService.create(createTrackingDetailDto);
  }

  @Get()
  findAll() {
    return this.trackingDetailService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trackingDetailService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrackingDetailDto: UpdateTrackingDetailDto) {
    return this.trackingDetailService.update(+id, updateTrackingDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trackingDetailService.remove(+id);
  }
}
