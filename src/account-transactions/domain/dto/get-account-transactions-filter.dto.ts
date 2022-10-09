import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { AccountTransactionStatus } from '../account-transactions.enums';

export class GetAccountTransactionsFilterDto {
  @IsOptional()
  @IsEnum(AccountTransactionStatus)
  status: AccountTransactionStatus;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search: string;
}
