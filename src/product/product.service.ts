import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from 'src/user/entities/user.entity';
import { eUserRole } from 'src/user/enums/userRole.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){}

  async create(createProductDto: CreateProductDto, user: User | undefined) {
    // console.log(user)
    const existing = await this.productRepository.findOne({
      where: {
        name: createProductDto.name,
        owner: { id: user?.id }
      }
    });

    if (existing) {
      throw new ConflictException(
        'You already created a product with this name. Try editing it instead.'
      );
    }
    try{
      let newProduct =  this.productRepository.create({
        ...createProductDto,
        owner: user
      })

      let data = await this.productRepository.save(newProduct);

      return {
        data,
        message: "Product created successfully!"
      }
    }catch(error){
      throw new ConflictException(error)
    }
  }

  async findAll() {
    try{
      let products = await this.productRepository.find({
        relations: {
          owner: true
        }
      })
      return {
        products: plainToInstance(Product, products),
        message: "Products fetched successfully!"
      }
    }catch(error){
      throw new ConflictException(error)
    }
  }

  async findByOwner(user: User) {
    try{
      let products = await this.productRepository.find({
        where: {
          owner: { id: user.id }
        },
        relations: {
          owner: true
        }
      });
      return {
        products: plainToInstance(Product, products),
        message: "Products fetched successfully!"
      }
    }catch(error){
      throw new ConflictException(error)
    }
  }

  async findOne(id: number) {
    try{
      let product = await this.productRepository.findOne({
        where: { id },
        relations: {
          owner: true
        }
      });
      if(!product){
        throw new NotFoundException()
      }
      return {
        product: plainToInstance(Product, product),
        message: `Product #${id} fetched successfully!`
      };
    }catch(error){
      throw new ConflictException(error)
    }
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
