import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ePaymentStatus } from './enums/paymentStatus.enum';
import { eCurrency } from 'src/product/enums/currency.enum';
import { OrderService } from 'src/order/order.service';
import { User } from 'src/user/entities/user.entity';
import { eOrderStatus } from 'src/order/enums/orderStatus.enum';
import { Order } from 'src/order/entities/order.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly orderService: OrderService,
    private dataSource: DataSource
  ){}
  private logger = new Logger(PaymentService.name)


  async findLatestPaymentForOrder(orderId: number) {
    return await this.paymentRepository.findOne({
      where: { order: { id: orderId } },
      order: { timestamp: 'DESC' },
      relations: {
        order: {
          user: true
        }
      }
    });
  }

  async createPayment({ order, amount, method, currency = eCurrency.NGN }): Promise<Payment> {
    const payment = this.paymentRepository.create({
      order,
      amount,
      currency,
      method,
      status: ePaymentStatus.PENDING,
    });
    return await this.paymentRepository.save(payment);
  }

  async intializePaystackPayment(payment: Payment){
    const secretKey = this.configService.get('environment.paystackSecretKey')
    const headers = {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    };
    const body = { 
      email: payment.order.user.email,
      amount: Math.round(Number(payment.amount) * 100),
      metadata: {
        custom_order_id: payment.order.id,
        payment_id: payment.id,
      },
      callback_url: `${this.configService.get('environment.frontendBaseUrl')}/payment/callback`,
    };
    const response$ = this.httpService.post('https://api.paystack.co/transaction/initialize', body, { headers });
    const response = await firstValueFrom(response$);
    const data = response.data;
    
    payment.transactionId = data.data.reference ?? null;
    payment.gatewayResponseData = data;
    payment.gatewayMessage = data.message;

    await this.paymentRepository.save(payment);

    return data;
  }



  async handlePayStackCallback(reference: string, user: User){
    // Verify from paystack's end,
    // If successfull, extract the order id, 
    // Call update service method that updates the order and cart based on successful payment.
    // Call trackingupdate service that creates a new tracking update based on the order too.
    if(!reference){
      throw new BadRequestException('reference is required')
    }
    

    const res =  await this.verifyPaystackPayment(reference)
    if (res.data.status !== 'success') {
      return { processed: false, reason: 'gateway_failed' };
    }

    let gatewayStatus= res.data.status;
    const gatewayRef = res.data.reference;

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try{
      let payment = await queryRunner.manager.findOne(Payment, {
        where: { transactionId: gatewayRef }, 
        lock: { mode : "pessimistic_write" }
      });
      if (!payment && res.data.metadata?.payment_id) {
        payment = await queryRunner.manager.findOne(Payment,{ 
          where: { id: Number(res.data.metadata.payment_id) }, 
          lock: { mode : "pessimistic_write" }
        });
      }
      if (!payment) {
        this.logger.warn(`Payment not found for reference ${gatewayRef}`);
        await queryRunner.rollbackTransaction()
        return { processed: false, reason: 'payment_not_found', raw: res };
      }

      let order = await queryRunner.manager.findOne(Order, {
        where: { id: payment.orderId },
        relations: ['cart'],
      });

      if (order?.status === eOrderStatus.PAID) {
        await queryRunner.rollbackTransaction()
        return { processed: false, reason: 'already_processed', payment };
      }

      payment.gatewayResponseData = res;
      payment.transactionId = gatewayRef;
      if (gatewayStatus === 'failed') {
        payment.status = ePaymentStatus.FAILED;
        await queryRunner.manager.save(payment)
        await queryRunner.commitTransaction()
        return {
          processed: true,
          status: gatewayStatus
        }
      } else if (gatewayStatus === 'pending') {
        payment.status = ePaymentStatus.PENDING;
        await queryRunner.manager.save(payment)
        await queryRunner.commitTransaction()
        return {
          processed: true,
          status: gatewayStatus
        }
      }

      payment.status = ePaymentStatus.SUCCESS
      await queryRunner.manager.save(payment)
      // const order = payment.order;
      if(!order){
        await queryRunner.rollbackTransaction();
        return { processed: false, reason: 'order_not_found' };
      }
      if (order.status !== eOrderStatus.PENDING) {
        await queryRunner.rollbackTransaction();
        return { processed: false, reason: 'order_not_pending' };
      }

      await this.orderService.handleSuccessfulPaymentUpdate(order, payment, queryRunner)
      await queryRunner.manager.save(payment)

      await queryRunner.commitTransaction();
      return { processed: true, payment };
    }catch(err){
      await queryRunner.rollbackTransaction();
      this.logger.error('Payment processing failed', err);
      throw err;
    }finally{
      await queryRunner.release()
    }
  }

  // private async processSuccessfulPayment(payment: Payment, user:User) {
  //   const order = await this.orderService.findOne(payment.order.id, user);
  //   if (!order) {
  //     this.logger.error(`Order ${payment.order.id} not found while processing payment ${payment.id}`);
  //     return;
  //   }

  //   if (order.status !== eOrderStatus.PENDING) {
  //     this.logger.log(`Order ${order.id} already marked paid; skipping processing`);
  //     return;
  //   }

  //   await this.orderService.handleSuccessfulPaymentUpdate(order, payment);
  //   this.logger.log(`Processed successful payment ${payment.id} for order ${order.id}`);
  // }


  async verifyPaystackPayment(reference: string){
    const secretKey = this.configService.get('environment.paystackSecretKey')
    const headers = {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    };
    try{
      const response = await lastValueFrom(
        this.httpService.get(`https://api.paystack.co/transaction/verify/${reference}`, { headers })
      )
      return response.data;
    }catch(error){
      throw error;
    }
  }

  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
