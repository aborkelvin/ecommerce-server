import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { Request } from 'express';
import { User } from 'src/user/entities/user.entity';
import { Roles } from 'src/auth/guards/roles.decorator';
import { eUserRole } from 'src/user/enums/userRole.enum';
import { Public } from 'src/auth/guards/ispublic.deco';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(eUserRole.ADMIN)
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request
  ) {
    return await this.productService.create(createProductDto, req.user as User);
  }

  @Public()
  @Get()  
  async findAll() {
    return await this.productService.findAll();
  }

  @Roles(eUserRole.ADMIN)
  @Get('/admin/mine')
  async findMyProducts(@Req() req: Request) {
    return await this.productService.findByOwner(req.user as User);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productService.findOne(+id);
  }

  @Roles(eUserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
