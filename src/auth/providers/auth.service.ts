import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '../dto/login.dto';
import { Bcrypt } from './bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
    private bcryptProvider: Bcrypt
  ){}

  async signUp(createUser: CreateUserDto) {
    const newUser = await this.userService.createNewUser(createUser)
    try{
      const payload = {
        sub: newUser.id,
        ...newUser
      }
      const access_token = await this.jwtService.signAsync(payload,{
        expiresIn: "7d",
      })
      // console.log(access_token)

      return {
        access_token,
        user: newUser
      }
    }catch(err){
      throw new ConflictException(err)
    }
  }

  async login(loginDto: LoginDto){
    const user = await this.userService.findOne(loginDto.email)
    const verifyPassword = await this.bcryptProvider.verifyPassword(loginDto.password, user.password)
    if(!verifyPassword){
      throw new UnauthorizedException('Invalid credentials')
    }
    const {password, ...userData} = user;
    const payload = {
      sub: user.id,
      ...userData
    }
    const access_token = await this.jwtService.signAsync(payload)
    return {
      access_token,
      user: userData
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
