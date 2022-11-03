import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import {
  AuthCredentialsSignUpDto,
  AuthCredentialsSignInDto,
} from '../domain/dto/auth-credentials.dto';
import { JwtPayload } from '../domain/jwt-payload.interface';
import { ISignIn } from '../domain/sign-in.interface';
import { User } from '../domain/user.entity';
import { UsersRepositoryService } from '../domain/users.repository';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersRepositoryService)
    private readonly usersRepositoryService: UsersRepositoryService,
    private jwtService: JwtService,
  ) {}

  signUp(authCredentialsDto: AuthCredentialsSignUpDto): Promise<User> {
    return this.usersRepositoryService.createUser(authCredentialsDto);
  }

  async signIn(
    authCredentialsSignInDto: AuthCredentialsSignInDto,
  ): Promise<ISignIn> {
    const { username, password } = authCredentialsSignInDto;
    const user = await this.usersRepositoryService.findOne({
      where: { username: username },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = {
        username,
        userId: user.id,
        name: user.name,
      };
      const accessToken = await this.jwtService.sign(payload);

      return { accessToken };
    } else {
      throw new UnauthorizedException('Please check upir login credentials');
    }
  }
}
