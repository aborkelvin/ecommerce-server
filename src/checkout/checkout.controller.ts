import { Controller, Param, Post, Req } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { User } from 'src/user/entities/user.entity';
import type { Request } from 'express';

@Controller('checkout')
export class CheckoutController {
    constructor(
        private checkoutService: CheckoutService
    ){}

    @Post('/pay/:orderId')
    async makePayment(
        @Param('orderId') orderId: number,
        @Req() req: Request
    ) {
        return await this.checkoutService.makePayment(orderId, req.user as User);
    }
}
