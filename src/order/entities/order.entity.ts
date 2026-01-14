import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CartItem } from "src/cart-item/entities/cart-item.entity";
import { eOrderStatus } from "../enums/orderStatus.enum";
import { OrderItem } from "src/order-item/entities/order-item.entity";
import { Payment } from "src/payment/entities/payment.entity";
import { TrackingDetail } from "src/tracking-detail/entities/tracking-detail.entity";
import { Cart } from "src/cart/entities/cart.entity";

@Entity()
export class Order {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        type: "decimal",
        precision: 10,
        scale: 2
    })
    totalPrice: number

    @ManyToOne(() => User, (user) => user.orders,{
        eager: true,
    })
    user: User

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
    orderItems?: OrderItem[]
    
    @Column({
        type: 'enum',
        enum: eOrderStatus,
        default: eOrderStatus.PENDING,
        nullable: false,
    })
    status: eOrderStatus;

    @ManyToOne(() => Cart, (cart) => cart.orders, {
        eager: true,
    })
    @JoinColumn() 
    cart: Cart;

    @Column({
        unique: true,
        nullable: true,
    })
    idempotencyKey: string;

    @Column({
        nullable: true
    })
    cartVersionSnapshot: number;

    @CreateDateColumn()
    createDate: Date;

    @UpdateDateColumn()
    updateDate: Date;

    @OneToMany(() => Payment, (payment) => payment.order)
    payments?: Payment[]

    @OneToMany(() => TrackingDetail, (trackingDetail) => trackingDetail.order)
    trackingDetails?: TrackingDetail[]
}
