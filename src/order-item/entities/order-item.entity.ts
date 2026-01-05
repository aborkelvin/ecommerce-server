import { Order } from "src/order/entities/order.entity";
import { Product } from "src/product/entities/product.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['order', 'product']) //This is to ensure at db level that the same orderId and productId doesnt exist together, 
// hence each order only contains one type of each product,
// TODO: Also implement a logic in the service to return a better error response to the user about this.
export class OrderItem {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        default: 1,
    })
    quantity: number

    @Column({
        nullable: false,
    })
    priceAtPurchase: number

    @Column({
        nullable: false,
    })
    productNameAtPurchase: string

    @ManyToOne(() => Order, (order) => order.orderItems)
    order: Order;

    @ManyToOne(() => Product, (product) => product.orderItems)
    product: Product;
}
