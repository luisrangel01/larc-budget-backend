import { IsEnum } from 'class-validator';

import { UserStatus } from '../user.enums';

export class UpdateTaskStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;
}
