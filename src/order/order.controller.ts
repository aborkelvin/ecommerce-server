import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Headers } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import type { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { Public } from 'src/auth/guards/ispublic.deco';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/create')
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
    @Headers('x-idempotency-Key') idempotencyKey: string,
  ) {
    return await this.orderService.createOrder(createOrderDto, req.user as User, idempotencyKey);
  }

 

  @Get()
  findAllOrdersByAUser(
    @Req() req: Request
  ) {
    return this.orderService.findAllOrdersByAUser( req.user as User);
  }

  @Get('admin/all')
  findAllOrdersForAdmin(
    @Req() req: Request
  ) {
    return this.orderService.findAllOrdersForAdmin();
  }

  @Get(':id')
  findOneOrderByAUser(
    @Param('id') id: string,  
    @Req() req: Request
  ) {
    return this.orderService.findOneOrderByAUser(+id, req.user as User);
  }

  @Get('admin/:id')
  findOneOrderForAdmin(
    @Param('id') id: string,
  ) {
    return this.orderService.findOneOrderByIdForAdmin(+id);
  }

  // @IsAdmin()
  @Patch('/admin/:id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
