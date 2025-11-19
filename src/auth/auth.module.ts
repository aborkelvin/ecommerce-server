import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { AuthController } from './auth.controller';
import { Bcrypt } from './providers/bcrypt';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService, Bcrypt],
  imports: [
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get('environment.jwtSecret'),
        signOptions: { expiresIn: configService.get('environment.jwtExpiry'), }
      })
    })
  ],
  exports: [
    AuthService, 
    Bcrypt,
    JwtModule
  ],
})
export class AuthModule {}
