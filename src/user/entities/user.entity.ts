import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { eUserRole } from "../enums/userRole.enum";
import { Product } from "src/product/entities/product.entity";
import { Cart } from "src/cart/entities/cart.entity";
import { Order } from "src/order/entities/order.entity";
import { Exclude } from "class-transformer";
import { eUserProviderStrategy } from "../enums/userProviderStrategy";
import { Upload } from "src/uploads/entities/upload.entity";

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
        type: "varchar"
    })
    name: string;
    
    @Column({
        unique: true,
        nullable: false
    })
    email: string;

    @Column({
        nullable: true
    })
    @Exclude()
    password: string;

    @Column({
        type: "enum" ,
        enum: eUserRole,
        default: eUserRole.CUSTOMER,
        nullable: false
    })
    role?: eUserRole

    @Column({
        nullable: true
    })
    providerId?: string;

    @Column({
        nullable: true,
        type: "enum",
        default: eUserProviderStrategy.LOCAL,
        enum: eUserProviderStrategy
    })
    provider: string;


    //Relationships that depend on the user, necessarily defined because of queries and because of typescript

    //orders? //This relationship should be defined in the orders entity
    @OneToMany(() =>  Product, (product)=> product.owner)
    products?: Product[]

    @OneToMany(() =>  Cart, (cart)=> cart.owner)
    carts?: Cart[]

    
    @OneToMany(() =>  Order, (order)=> order.user)
    orders?: Order[]

    @OneToMany(() =>  Upload, (upload)=> upload.owner)
    uploads?: Upload[]
}