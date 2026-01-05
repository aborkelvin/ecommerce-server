import { PartialType } from '@nestjs/mapped-types';
import { CreateCartItemDto } from './create-cart-item.dto';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto extends PartialType(CreateCartItemDto) {
    @IsInt()
    @Min(0)
    quantity: number;
}
