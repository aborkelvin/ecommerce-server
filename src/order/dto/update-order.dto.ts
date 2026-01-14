import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { eOrderStatus } from '../enums/orderStatus.enum';
import { IsEnum, IsOptional, NotEquals } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
    
    @IsOptional()
    @IsEnum(eOrderStatus, {message: 'status must be a valid enum value'})
    @NotEquals(eOrderStatus.PENDING, {message: 'Cannot change status back to pending'})
    @NotEquals(eOrderStatus.PAID, {message: 'Cannot manually change status to paid'})
    status?: eOrderStatus;
}
