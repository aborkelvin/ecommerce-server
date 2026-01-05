import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import type { Request } from 'express';
import { User } from 'src/user/entities/user.entity';

@Controller('cart-items')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  @Post()
  async addItemToCart(
    @Body() createCartItemDto: CreateCartItemDto,
    @Req() req: Request
  ) {
    return await this.cartItemService.addItemToCart(createCartItemDto, req.user as User);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartItemService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Req() req: Request
  ) {
    return this.cartItemService.update(+id, updateCartItemDto, req.user as User);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request
  ) {
    return await this.cartItemService.removeItemFromCart(+id, req.user as User);
  }
}
