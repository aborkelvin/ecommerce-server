import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { In, Not, QueryRunner, Repository } from 'typeorm';
import { CartService } from 'src/cart/cart.service';
import { User } from 'src/user/entities/user.entity';
import { eOrderStatus } from './enums/orderStatus.enum';
import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { OrderItemService } from 'src/order-item/order-item.service';
import { Product } from 'src/product/entities/product.entity';
import { eCartStatus } from 'src/cart/enums/cartStatus.enum';
import { PaymentService } from 'src/payment/payment.service';
import { Payment } from 'src/payment/entities/payment.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { TrackingDetail } from 'src/tracking-detail/entities/tracking-detail.entity';
import { eTrackingStatus } from 'src/tracking-detail/enums/trackingStatus.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private readonly cartService: CartService,
    private readonly orderItemService: OrderItemService,
  ){}

  

  async createOrder(createOrderDto: CreateOrderDto, user: User, idempotencyKey: string) {
    // Check if order with same idempotency key exists for the user and return it if yes
    // Find cart by id,
    // Calculate totalPrice based on the currentPrice of the currentItems,
    // Create the order,
    // Loop through cartitems and create order items for each with the order already created

    const existingOrder = await this.orderRepository.findOne({
      where: { idempotencyKey }
    })
    if(existingOrder){
      return {
        message: "Order already exists",
        orderId: existingOrder.id,
        amount: existingOrder.totalPrice,
      }
    }
    const queryRunner = this.orderRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try{
      const { cart } = await this.cartService.findCartById(createOrderDto.cartId, user);

      if (!cart.cartItems || cart.cartItems.length === 0) {
        throw new BadRequestException('Your cart is empty');
      }

      const totalPrice = cart.cartItems.reduce((sum, item) => {
        if (item.product.quantityInStock < item.quantity) {
          throw new BadRequestException(
            `Product "${item.product.name}" has only ${item.product.quantityInStock} left`
          );
        }
        return sum + item.quantity * item.product.price;
      }, 0);

      const order = queryRunner.manager.create(Order, {
        totalPrice,
        user,
        status: eOrderStatus.PENDING,
        cart,
        cartVersionSnapshot: cart.cartVersion,
      });

      const savedOrder = await queryRunner.manager.save(order);

      const orderItemsData = cart.cartItems.map((item) => ({
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
        productNameAtPurchase: item.product.name,
        product: item.product,
        order: savedOrder,
      }));
      const orderItems = queryRunner.manager.create(OrderItem, orderItemsData);
      await queryRunner.manager.save(orderItems);

      // cart.status = eCartStatus.PENDING_CHECKOUT;
      // await queryRunner.manager.save(cart);

      await queryRunner.commitTransaction();

      return {
        message: "Order created. Proceed to payment.",
        orderId: savedOrder.id,
        amount: savedOrder.totalPrice,
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
        
  }

  async findAllOrdersByAUser(user: User) {
    return await this.orderRepository.find({
      where: {
        user: {id: user.id},
        status: Not(In([eOrderStatus.ABANDONED, eOrderStatus.PENDING]))
      }
    })
  }

  async findAllOrdersForAdmin(){
    return await this.orderRepository.find({
      where:{
        status: Not(In([eOrderStatus.ABANDONED, eOrderStatus.PENDING]))
      }
    })
  }

  async findOneOrderByAUser(id: number, user: User) {
    const order = await this.orderRepository.findOne({
      where: { 
        id,
        user: { id: user.id }
      },
      relations: {
        user: true
      }
    })
    if(!order){
      throw new NotFoundException('Order Not Found')
    }
    return order;
  }

  async findOneOrderByIdForAdmin(id: number) {
    const order = await this.orderRepository.findOneBy({id});
    if(!order){
      throw new NotFoundException('Order Not Found')
    }
    return order;
  }

  async handleSuccessfulPaymentUpdate(order: Order, payment: Payment, queryRunner: QueryRunner ) {

    order.status = eOrderStatus.PAID;
    await queryRunner.manager.save(order);
    
    await queryRunner.manager.update(
      Order,
      { 
        cart: { id: order.cart.id},
        status: eOrderStatus.PENDING,
        id: Not(order.id)
      },
      { status: eOrderStatus.ABANDONED}
    )

    // handle other side-effects (update cart status, clear cart, create tracking)
    // create tracking update and other side effects (call other services/repositories)
    
    if (!order.cart?.id) {
      throw new Error(`Order ${order.id} has no cart attached`);
    }
    const updateResult = await queryRunner.manager.update(
      Cart,
      {
        id:order.cart.id,
        status: eCartStatus.ACTIVE,
      },
      { status: eCartStatus.CONVERTED_TO_ORDER }
    )

    if(updateResult.affected == 0){
      throw new Error(`Cart ${order.cart.id} not in valid state for conversion`);
    }


    const orderItems = await queryRunner.manager.find(OrderItem, {
      where: { order: { id: order.id } },
      relations: ['product'],
    });

    if (!orderItems.length) {
      throw new Error(`Order ${order.id} has no order items`);
    }

    // Reduce stock safely with row locks
    for (const item of orderItems) {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: item.product.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product) {
        throw new Error(`Product ${item.product.id} not found`);
      }

      if (product.quantityInStock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.quantityInStock}`
        );
      }

      product.quantityInStock -= item.quantity;

      await queryRunner.manager.save(product);
    }


    const trackingDetail = queryRunner.manager.create(
      TrackingDetail,
      {
        status: eTrackingStatus.PROCESSING,
        order,
      }
    )

    await queryRunner.manager.save(trackingDetail)
    return order;
  }


  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const result = await this.orderRepository.update(id, updateOrderDto);
    if(result.affected === 0){
      throw new NotFoundException('Order Not Found')
    }
    return await this.orderRepository.findOneBy({id});
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
