import { Module } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItemController } from './cart-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';

@Module({
  controllers: [CartItemController],
  providers: [CartItemService],
  imports: [
    TypeOrmModule.forFeature([CartItem])
  ]
})
export class CartItemModule {}
