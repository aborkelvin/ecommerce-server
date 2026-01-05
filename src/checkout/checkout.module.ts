import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { PaymentModule } from 'src/payment/payment.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  controllers: [CheckoutController],
  providers: [CheckoutService],
  imports: [
    PaymentModule,
    OrderModule
  ]
})
export class CheckoutModule {}
