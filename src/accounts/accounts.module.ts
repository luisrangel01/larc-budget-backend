/* eslint-disable hexagonal-architecture/enforce */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from 'src/auth/auth.module';
import { AccountsController } from './infrastructure/accounts.controller';
import { AccountsService } from './application/accounts.service';
import { AccountsRepositoryService } from './domain/accounts.repository';
import { Account } from './domain/account.entity';
import { AccountTransactionsRepositoryService } from '../account-transactions/domain/account-transactions.repository';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Account]), AuthModule],
  providers: [
    AccountsService,
    AccountsRepositoryService,
    AccountTransactionsRepositoryService,
  ],
  controllers: [AccountsController],
})
export class AccountsModule {}
