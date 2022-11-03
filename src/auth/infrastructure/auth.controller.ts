import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from '../application/auth.service';
import {
  AuthCredentialsSignUpDto,
  AuthCredentialsSignInDto,
} from '../domain/dto/auth-credentials.dto';
import { ISignIn } from '../domain/sign-in.interface';
import { User } from '../domain/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-up')
  signUp(
    @Body() authCredentialsSignUpDto: AuthCredentialsSignUpDto,
  ): Promise<User> {
    return this.authService.signUp(authCredentialsSignUpDto);
  }

  @Post('/sign-in')
  signIn(
    @Body() authCredentialsSignInDto: AuthCredentialsSignInDto,
  ): Promise<ISignIn> {
    return this.authService.signIn(authCredentialsSignInDto);
  }

  @Post('/test')
  @UseGuards(AuthGuard())
  test(@Req() req) {
    console.log(`req.headers:`, req.headers);
    console.log(`req.user:`, req.user);
    const user = { ...req.user };
    if (user.password) {
      delete user.password;
    }
    return user;
  }
}
