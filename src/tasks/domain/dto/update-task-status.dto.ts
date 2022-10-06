import { IsEnum } from 'class-validator';

import { TaskStatus } from '../task.enums';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
