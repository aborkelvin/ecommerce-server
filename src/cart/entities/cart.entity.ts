import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { eCartStatus } from "../enums/cartStatus.enum";
import { CartItem } from "src/cart-item/entities/cart-item.entity";

@Entity()
export class Cart {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (user) => user.carts)
    owner: User

    @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
    cartItems?: CartItem[]
    
    @Column({
        type: 'enum',
        enum: eCartStatus,
        default: eCartStatus.ACTIVE,
        nullable: false,
    })
    status: eCartStatus;

    @CreateDateColumn()
    createDate: Date

    @UpdateDateColumn()
    updateDate: Date;
}
