import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";
import { eUserRole } from "../enums/userRole.enum";

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    password: string;

    @IsEnum(eUserRole, { message: "Invalid user role" })
    role?: eUserRole;
}
