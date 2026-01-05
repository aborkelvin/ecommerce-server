import { Cart } from "src/cart/entities/cart.entity";
import { Product } from "src/product/entities/product.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['cart', 'product']) //This is to ensure at db level that the same cartId and productId doesnt exist together, 
// hence each cart only contains one type of each product,
// TODO: Also implement a logic in the service to return a better error response to the user about this.
export class CartItem {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        default: 1,
    })
    quantity: number

    // @Column(
    //     nullable: false,
    // })
    // unitPrice: number

    @ManyToOne(() => Cart, (cart) => cart.cartItems)
    cart: Cart;

    @ManyToOne(() => Product, (product) => product.cartItems)
    product: Product;
}
