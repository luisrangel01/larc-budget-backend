import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { TaskStatus } from '../task.enums';

export class GetTasksFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search: string;
}
