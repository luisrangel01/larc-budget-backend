import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { GetUser } from 'src/auth/domain/get-user.decorator';
import { User } from 'src/auth/domain/user.entity';
import { AccountTransactionsService } from '../application/account-transactions.service';
import { AccountTransaction } from '../domain/account-transaction.entity';
import { CreateAccountTransactionDto } from '../domain/dto/create-account-transaction.dto';
import { GetAccountTransactionsFilterDto } from '../domain/dto/get-account-transactions-filter.dto';
import { TransferDto } from '../domain/dto/transfer.dto';
import { UpdateAccountTransactionStatusDto } from '../domain/dto/update-account-transaction-status.dto';
import { ResultUpdate } from '../domain/account-transaction.interface';

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

  @Post('/transfer')
  transfer(
    @GetUser() user: User,
    @Body() transferDto: TransferDto,
  ): Promise<AccountTransaction[]> {
    this.logger.verbose(
      `User "${user.username}" creating a new transfer. Data: ${JSON.stringify(
        transferDto,
      )}`,
    );
    return this.accountTransactionsService.transfer(user, transferDto);
  }

  @Patch('/:id/status')
  updateTaskStatus(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body()
    updateAccountTransactionStatusDto: UpdateAccountTransactionStatusDto,
  ): Promise<ResultUpdate> {
    this.logger.verbose(
      `User "${
        user.username
      }" updating status transaction. id: "${id}" Data: ${JSON.stringify(
        updateAccountTransactionStatusDto,
      )}`,
    );
    return this.accountTransactionsService.updateAccountTransactionStatus(
      user,
      id,
      updateAccountTransactionStatusDto,
    );
  }
}
