import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { eCartStatus } from "../enums/cartStatus.enum";
import { CartItem } from "src/cart-item/entities/cart-item.entity";
import { Order } from "src/order/entities/order.entity";

@Entity()
export class Cart {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (user) => user.carts)
    owner: User

    @OneToMany(() => CartItem, (cartItem) => cartItem.cart, {
        eager: true
    })
    cartItems?: CartItem[]
    
    @Column({
        type: 'enum',
        enum: eCartStatus,
        default: eCartStatus.ACTIVE,
        nullable: false,
    })
    status: eCartStatus;

    @OneToMany(() => Order, (order) => order.cart, {
    nullable: true,
    })
    orders?: Order[];

    @Column({
        type: "int",
        default: 0
    })
    cartVersion: number;

    @CreateDateColumn()
    createDate: Date

    @UpdateDateColumn()
    updateDate: Date;
}
