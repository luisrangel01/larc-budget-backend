import { Module } from '@nestjs/common';

import { AccountsController } from './infrastructure/accounts.controller';
import { AccountsService } from './application/accounts.service';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
