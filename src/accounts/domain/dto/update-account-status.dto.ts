import { IsEnum } from 'class-validator';

import { AccountStatus } from '../account.enums';

export class UpdateAccountStatusDto {
  @IsEnum(AccountStatus)
  status: AccountStatus;
}
