import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';

import { GetUser } from 'src/auth/domain/get-user.decorator';
import { User } from 'src/auth/domain/user.entity';
import { AccountTransactionsService } from '../application/account-transactions.service';
import { AccountTransaction } from '../domain/account-transaction.entity';
import { CreateAccountTransactionDto } from '../domain/dto/create-account-transaction.dto';
import { GetAccountTransactionsFilterDto } from '../domain/dto/get-account-transactions-filter.dto';
import { UpdateAccountTransactionDto } from '../domain/dto/update-account-transaction.dto';

@Controller('account-transactions')
@UseGuards(AuthGuard())
export class AccountTransactionsController {
  private logger = new Logger('AccountTransactionsController');

  constructor(private accountTransactionsService: AccountTransactionsService) {}

  @Get('/:accountId')
  getAccountTransactions(
    @GetUser() user: User,
    @Query() filterDto: GetAccountTransactionsFilterDto,
    @Param('accountId') accountId: string,
  ): Promise<AccountTransaction[]> {
    this.logger.verbose(
      `User "${
        user.username
      }" retrieving all transactions. Filters: ${JSON.stringify(filterDto)}`,
    );
    return this.accountTransactionsService.getAccountTransactions(
      user,
      filterDto,
      accountId,
    );
  }

  @Get('/transaction/:id')
  getAccountTransactionById(
    @GetUser() user: User,
    @Param('id') id: string,
  ): Promise<AccountTransaction> {
    return this.accountTransactionsService.getAccountTransactionById(user, id);
  }

  @Post()
  createAccountTransaction(
    @GetUser() user: User,
    @Body() createAccountTransactionDto: CreateAccountTransactionDto,
  ): Promise<AccountTransaction> {
    this.logger.verbose(
      `User "${
        user.username
      }" creating a new transaction. Data: ${JSON.stringify(
        createAccountTransactionDto,
      )}`,
    );
    return this.accountTransactionsService.createAccountTransaction(
      user,
      createAccountTransactionDto,
    );
  }
}