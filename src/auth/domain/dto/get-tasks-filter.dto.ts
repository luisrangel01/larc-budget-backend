import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { UserStatus } from '../user.enums';

export class GetTasksFilterDto {
  @IsOptional()
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search: string;
}
