import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './providers/auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './guards/ispublic.deco';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService

  ) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('/signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  loginWithGoogle(){}

  @Public()
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async handleGoogleRedirect(@Req() req: Request, @Res() res: Response){
    const user = req.user as any;
    const access_token = await this.authService.loginWithOAuth(user)
    res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/success?token=${access_token}`)
  }

  @Get('/profile')
  async getProfile(@Req() req:Request, @Res() res:Response){
    const user = req.user;
    res.json({
      user
    })
  }
}
