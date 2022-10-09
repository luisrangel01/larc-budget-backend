/* eslint-disable hexagonal-architecture/enforce */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from 'src/auth/auth.module';
import { AccountTransactionsController } from './infrastructure/account-transactions.controller';
import { AccountTransactionsService } from './application/account-transactions.service';
import { AccountsRepositoryService } from '../accounts/domain/accounts.repository';
import { AccountTransactionsRepositoryService } from './domain/account-transactions.repository';
import { AccountTransaction } from './domain/account-transaction.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AccountTransaction]),
    AuthModule,
  ],
  providers: [
    AccountTransactionsService,
    AccountTransactionsRepositoryService,
    AccountsRepositoryService,
  ],
  controllers: [AccountTransactionsController],
})
export class AccountTransactionsModule {}
