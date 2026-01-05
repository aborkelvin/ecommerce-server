import { IsInt, IsNotEmpty, IsPositive } from "class-validator";

export class CreateCartItemDto {
    
    @IsInt()
    @IsPositive()
    productId: number;

    @IsInt()
    @IsPositive()
    quantity: number; 
}
