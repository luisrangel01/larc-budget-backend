import { IsEnum } from 'class-validator';

import { AccountTransactionStatus } from '../account-transactions.enums';

export class UpdateAccountTransactionStatusDto {
  @IsEnum(AccountTransactionStatus)
  status: AccountTransactionStatus;
}
