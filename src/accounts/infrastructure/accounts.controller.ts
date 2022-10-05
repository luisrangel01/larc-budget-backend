import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';

import { User } from 'src/auth/domain/user.entity';
import { GetUser } from 'src/auth/domain/get-user.decorator';
import { AccountsService } from '../application/accounts.service';
import { Account } from '../domain/account.entity';
import { CreateAccountDto } from '../domain/dto/create-account.dto';
import { GetAccountsFilterDto } from '../domain/dto/get-accounts-filter.dto';
import { UpdateAccountDto } from '../domain/dto/update-account.dto';
import { UpdateAccountStatusDto } from '../domain/dto/update-account-status.dto';

@Controller('accounts')
export class AccountsController {
  private logger = new Logger('AccountsController');

  constructor(private accountsService: AccountsService) {}

  @Get()
  getAccounts(
    @GetUser() user: User,
    @Query() filterDto: GetAccountsFilterDto,
  ): Promise<Account[]> {
    this.logger.verbose(
      `User "${
        user.username
      }" retrieving all accounts. Filters: ${JSON.stringify(filterDto)}`,
    );
    return this.accountsService.getAccounts(user, filterDto);
  }

  @Get('/:id')
  getAccountById(
    @GetUser() user: User,
    @Param('id') id: string,
  ): Promise<Account> {
    return this.accountsService.getAccountById(user, id);
  }

  @Post()
  createAccount(
    @GetUser() user: User,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    this.logger.verbose(
      `User "${user.username}" creating a new account. Data: ${JSON.stringify(
        createAccountDto,
      )}`,
    );
    return this.accountsService.createAccount(user, createAccountDto);
  }

  @Patch('/:id')
  updateAccount(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<UpdateResult> {
    this.logger.verbose(
      `User "${
        user.username
      }" updating account. id: "${id}" Data: ${JSON.stringify(
        updateAccountDto,
      )}`,
    );
    return this.accountsService.updateAccount(user, id, updateAccountDto);
  }

  @Delete('/:id')
  deleteAccount(
    @GetUser() user: User,
    @Param('id') id: string,
  ): Promise<DeleteResult> {
    this.logger.verbose(
      `User "${user.username}" deleting account. id: "${id}"`,
    );
    return this.accountsService.deleteAccount(user, id);
  }

  @Patch('/:id/status')
  updateAccountStatus(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateAccountStatusDto: UpdateAccountStatusDto,
  ): Promise<Account> {
    this.logger.verbose(
      `User "${
        user.username
      }" updating status account. id: "${id}" Data: ${JSON.stringify(
        updateAccountStatusDto,
      )}`,
    );
    return this.accountsService.updateAccountStatus(
      user,
      id,
      updateAccountStatusDto,
    );
  }
}
