import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { User } from 'src/auth/domain/user.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Account } from '../domain/account.entity';
import { AccountsRepositoryService } from '../domain/accounts.repository';
import { CreateAccountDto } from '../domain/dto/create-account.dto';
import { GetAccountsFilterDto } from '../domain/dto/get-accounts-filter.dto';
import { UpdateAccountStatusDto } from '../domain/dto/update-account-status.dto';
import { UpdateAccountDto } from '../domain/dto/update-account.dto';

@Injectable()
export class AccountsService {
  private logger = new Logger('AccountsService');

  constructor(
    @Inject(AccountsRepositoryService)
    private readonly accountsRepositoryService: AccountsRepositoryService,
  ) {}

  getAccounts(user: User, filterDto: GetAccountsFilterDto): Promise<Account[]> {
    return this.accountsRepositoryService.getAccounts(user, filterDto);
  }

  async getAccountById(user: User, id: string): Promise<Account> {
    const found = await this.accountsRepositoryService.getAccount({
      where: { id, user },
    });
    if (!found) {
      throw new NotFoundException(`Account with ID "${id}" not found`);
    }

    return found;
  }

  createAccount(
    user: User,
    createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return this.accountsRepositoryService.createAccount(user, createAccountDto);
  }

  async updateAccount(
    user: User,
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<UpdateResult> {
    const result = await this.accountsRepositoryService.updateAccount(
      user,
      id,
      updateAccountDto,
    );
    if (result.affected === 0) {
      throw new NotFoundException(`Account with ID "${id}" not found`);
    }
    return result;
  }

  async deleteAccount(user: User, id: string): Promise<DeleteResult> {
    const result = await this.accountsRepositoryService.deleteAccount(user, id);
    if (result.affected === 0) {
      throw new NotFoundException(`Account with ID "${id}" not found`);
    }
    return result;
  }

  async updateAccountStatus(
    user: User,
    id: string,
    updateAccountStatusDto: UpdateAccountStatusDto,
  ): Promise<Account> {
    const account = await this.getAccountById(user, id);

    account.status = updateAccountStatusDto.status;

    await this.accountsRepositoryService.repository.save(account);

    return account;
  }
}
