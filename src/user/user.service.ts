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
    let user: User | null;
    try{
      user = await this.userRepository.findOneBy({
        email
      })
    }catch(err){
      throw new ConflictException(err)
    }
    if(!user){
      throw new NotFoundException('This user doesnt exist')
    }
    return user
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
