import { Module } from '@nestjs/common';

import { AuthController } from './infrastructure/auth.controller';
import { AuthService } from './application/auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
