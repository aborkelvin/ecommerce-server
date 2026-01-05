import { BadRequestException, ConflictException, Injectable, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Bcrypt } from 'src/auth/providers/bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly bcryptProvider:Bcrypt
  ){}
  async createNewUser(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto
    const hashedPassword = await this.bcryptProvider.hashUserPassword(password)
    try{
      let newUser = this.userRepository.create({
        ...userData,
        password: hashedPassword
      })
      const savedUser: Partial<User> = await this.userRepository.save(newUser)
      delete savedUser.password;
      return savedUser;
    }catch(err){
      if (err.code === '23505' ) {
        throw new ConflictException('Email already exists');
      }
      if (err.code === '23502') {
        throw new BadRequestException(`Missing required field: ${err.column}`);
      }
      throw new RequestTimeoutException(err)
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(email: string) {
    let user = await this.userRepository.findOneBy({
        email
      })
    if(!user){
      throw new NotFoundException('This user doesnt exist')
    }
    return user
  }

  async findOneOrNull(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findByProviderId(providerId: string){
    let user: User | null
    try{
      user = await this.userRepository.findOneBy({
        providerId
      })
    }catch(err){
      throw new ConflictException(err)
    }
    return user;
  }

  async createOAuthUser(userData:Partial<User>){
    let newUser:User;
    try{
      // const user = this.userRepository.create(userData)
      newUser = await this.userRepository.save(userData)
    }catch(err){
      if (err.code === '23505' ) {
        throw new ConflictException('Email already exists');
      }
      if (err.code === '23502') {
        throw new BadRequestException(`Missing required field: ${err.column}`);
      }
      throw new RequestTimeoutException(err)
    }

    return newUser;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
