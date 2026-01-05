import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { eCurrency } from "../enums/currency.enum";
import { CartItem } from "src/cart-item/entities/cart-item.entity";
import { OrderItem } from "src/order-item/entities/order-item.entity";

@Entity()
export class Product {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        type: "varchar"
    })
    name: string

    @Column({
        nullable: false,
        type: "varchar"
    })
    description: string

    @Column({
        nullable: false,
        type: "float"
    })
    price: number

    @Column({
        nullable: false,
        default: 0,
        type: "int"
    })
    quantityInStock: number

    @Column({
        type: "enum",
        enum: eCurrency,
        default: eCurrency.NGN
    })
    currency: string

    @Column({
        nullable: true,
    })
    bannerImage: string

    @Column({
        nullable: true,
    })
    detailImage: string

    @ManyToOne(() => User, (user) => user.products)
    owner: User

    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems?: CartItem[]
    
    @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
    orderItems?: OrderItem[]
}
