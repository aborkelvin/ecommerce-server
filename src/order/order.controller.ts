import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import type { Request } from 'express';
import { User } from 'src/user/entities/user.entity';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/create')
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request
  ) {
    return await this.orderService.createOrder(createOrderDto, req.user as User);
  }

 

  @Get()
  findAll(
    @Req() req: Request
  ) {
    return this.orderService.findAll( req.user as User);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
