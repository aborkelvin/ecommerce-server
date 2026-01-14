import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { eCartStatus } from './enums/cartStatus.enum';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ){}

  async incrementCartVersion(cart: Cart){
    cart.cartVersion+=1;
    return await this.cartRepository.save(cart);
  }

  async findOrCreateActiveCart(user: User){
    let cart = await this.cartRepository.findOne({
      where: {
        owner: { id: user.id },
        status: eCartStatus.ACTIVE
      }
    })

    if(!cart){
      let createCart = this.cartRepository.create({
        owner:user,
        status: eCartStatus.ACTIVE
      })
      try{
        cart = await this.cartRepository.save(createCart)
      }catch(error){
        throw new ConflictException(error)
      }
    }

    return cart;
  }

  create(createCartDto: CreateCartDto) {
    return 'This action adds a new cart';
  }

  async findAll(user: User) {
    return await this.cartRepository.find({
      where:{
        owner: {id: user.id}
      }
    })
  }

  async findActiveCart(user:User) {
    return await this.cartRepository.findOne({
      where:{ 
        status: eCartStatus.ACTIVE,
        owner: { id: user.id}
      },
      relations: {
        cartItems: {
          product: true
        }
      }
    })
  }

  async findCartById(id: number, user: User) {
    const cart = await this.cartRepository.findOne({
      where:{ 
        id,
        owner: { id: user.id },
        status: eCartStatus.ACTIVE
      },
      relations: {
        cartItems: {
          product: true
        }
      }
    })
    if(!cart){
      throw new NotFoundException('No active cart found')
    }

    return {
      cart,
      message: "Cart found successfully!"
    }
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
