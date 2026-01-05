import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Repository } from 'typeorm';
import { ProductService } from 'src/product/product.service';
import { User } from 'src/user/entities/user.entity';
import { CartService } from 'src/cart/cart.service';
import { Cart } from 'src/cart/entities/cart.entity';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class CartItemService {

  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    private readonly productService: ProductService,
    private readonly cartService: CartService
  ){}
  private readonly logger = new Logger(CartItemService.name)

  async addItemToCart(createCartItemDto: CreateCartItemDto, user: User){
    
    //Check if product exists,(product's service throws an error if it doesnt)
    //Check if an active cart exists, if no then create one instantly
    // Check if item already exists in the cart, if yes just increase quantity,
    // Create the cartitem with the product and cart if it doest exist.

    const { product } = await this.productService.findOne(createCartItemDto.productId)
    const cart = await this.cartService.findOrCreateActiveCart(user)
    let cartItem  = await this.checkCartItemInCart(cart, product);
    
    if(product.quantityInStock < createCartItemDto.quantity){
      throw new BadRequestException(`The product ${product.name} has only ${product.quantityInStock} left`)
    }
    if(cartItem){
      cartItem.quantity+= createCartItemDto.quantity
    }else{
      cartItem = this.cartItemRepository.create({
        quantity: createCartItemDto.quantity,
        // unitPrice: product.price,
        cart,
        product
      })
    }

    const savedItem = await this.cartItemRepository.save(cartItem)

    // return {
    //   message: "Item added to cart successfully!",
    //   data: savedItem
    // }
    return await this.cartService.findActiveCart(user)
  }

  async checkCartItemInCart(cart: Cart, product: Product){
    try{
     let cartItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: product.id }
      }
     })
     return cartItem;
    }catch(error){
      throw new ConflictException(error)
    }
  }

  async findAllCartItemsPerCart(cart: Cart) {
    try{
     let cartItems = await this.cartItemRepository.find({
      where: {
        cart: { id: cart.id }
      }
     })
     return {
      cartItems,
      message: "CartItems found successfully"
     }
    }catch(error){
      throw new ConflictException(error)
    }
  }

  async removeItemFromCart(itemId:number ,user: User){
    const userActiveCart = await this.cartService.findActiveCart(user)
    if(!userActiveCart){
      throw new NotFoundException("No active cart found")
    }

    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: itemId,
        cart: { id: userActiveCart.id }
      }
    })

    if(!cartItem){
      throw new NotFoundException("Item not found in your cart")
    }

    await this.cartItemRepository.remove(cartItem)
    
    // return {
    //   message: "Item removed from cart"
    // }
    return await this.cartService.findActiveCart(user)
  }

  findOne(id: number) {
    return `This action returns a #${id} cartItem`;
  }

  async update(id: number, updateCartItemDto: UpdateCartItemDto, user: User) {
 
    let cartItem = await this.cartItemRepository.findOne({
      where: { id },
      relations: {
        cart: { owner: true },
        product: true
      }
    })
    if(!cartItem || cartItem.cart.owner.email !== user.email){
      throw new NotFoundException('Cart item not found in your cart')
    }

    const { quantity } = updateCartItemDto;

    if(quantity === 0) {
      await this.cartItemRepository.delete(cartItem.id)
      return await this.cartService.findActiveCart(user)
    }

    if(quantity > cartItem.product.quantityInStock){
      throw new BadRequestException(`The product ${cartItem.product.name} has only ${cartItem.product.quantityInStock} left`)
    }

    cartItem.quantity = quantity;
    await this.cartItemRepository.save(cartItem)
    return await this.cartService.findActiveCart(user)

  }

  // async remove(id: number, user: User) {
  //   await this.cartItemRepository.delete(id);
  //   return await this.cartService.findActiveCart(user)
  // }
}
