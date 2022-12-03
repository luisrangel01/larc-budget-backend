/* eslint-disable hexagonal-architecture/enforce */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './infrastructure/auth.controller';
import { AuthService } from './application/auth.service';
import { User } from './domain/user.entity';
import { UsersRepositoryService } from './domain/users.repository';
import { JwtStrategy } from './domain/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: 'DhtwV47UK' ?? configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: 36000 ?? configService.get('JWT_SECRET_EXPIRES_IN'),
          },
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, JwtStrategy, UsersRepositoryService],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
