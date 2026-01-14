import { BadRequestException, Injectable } from '@nestjs/common';
import { eOrderStatus } from 'src/order/enums/orderStatus.enum';
import { OrderService } from 'src/order/order.service';
import { ePaymentMethod } from 'src/payment/enums/paymentMethod.enum';
import { ePaymentStatus } from 'src/payment/enums/paymentStatus.enum';
import { PaymentService } from 'src/payment/payment.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CheckoutService {
    constructor(
        private readonly orderService: OrderService,
        private readonly paymentService: PaymentService
    ){}

    async makePayment(orderId: number, user: User){
        const order = await this.orderService.findOneOrderByAUser(orderId, user)
        if(order.status !== eOrderStatus.PENDING ){ // If pay on delivery happens, this logic changes
            throw new BadRequestException('Order already paid or abandoned')
        }


        //Check if we have an existing pending payment tried for this order;
        let payment = await this.paymentService.findLatestPaymentForOrder(orderId);
        if (!payment || (payment.status !== ePaymentStatus.PENDING)) {
            payment = await this.paymentService.createPayment({
                order,
                amount: order.totalPrice,
                method: ePaymentMethod.PAYSTACK,
            });
            console.log('no no payment')
        }

        const initResponse = await this.paymentService.intializePaystackPayment(payment);
        return initResponse;
    }

}
