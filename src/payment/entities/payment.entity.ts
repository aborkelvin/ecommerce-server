import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Unique, RelationId, UpdateDateColumn } from 'typeorm';
import { ePaymentStatus } from '../enums/paymentStatus.enum';
import { ePaymentMethod } from '../enums/paymentMethod.enum';
import { Order } from 'src/order/entities/order.entity';
import { eCurrency } from 'src/product/enums/currency.enum';

@Entity()
export class Payment {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({
        type: "decimal", 
        precision: 10,
        scale: 2
    })
    amount: number; 

    @Column({
        type: 'enum',
        enum: ePaymentMethod,
        nullable: false,
    })
    method: ePaymentMethod; 

    @Column({
        type: 'enum',
        enum: ePaymentStatus,
        default: ePaymentStatus.PENDING,
        nullable: false,
    })
    status: ePaymentStatus;

    // Provided by the payment gateway (Stripe, PayPal, etc.)
    @Column({
        nullable: true, 
        unique: true,
    })
    transactionId?: string;

    @CreateDateColumn()
    timestamp: Date; // When the payment record was created

    @UpdateDateColumn()
    updatedAt:Date;

    // A single order can have many payment attempts (e.g" initial failure, retry success)
    @ManyToOne(() => Order, (order) => order.payments, { onDelete: 'CASCADE' })
    order: Order;

    
    @RelationId((payment: Payment) => payment.order)
    orderId: number;

    @Column({
        nullable: false,
        type: "enum",
        enum: eCurrency,
        default: eCurrency.NGN
    })
    currency: eCurrency;

    @Column({
        nullable: true,
        type: "jsonb"
    })
    gatewayResponseData?: any; 
    
    @Column({
        nullable: true,
        type: "varchar"
    })
    gatewayMessage: string; 

}