import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from './jwt-payload.interface';
import { User } from './user.entity';
import { UsersRepositoryService } from './users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersRepositoryService: UsersRepositoryService,
    private configService: ConfigService,
  ) {
    super({
      secretOrKey: 'DhtwV47UK' ?? configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { username } = payload;
    console.log(`username from validate:`, username);
    const user: User = await this.usersRepositoryService.findOne({
      where: { username: username },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
