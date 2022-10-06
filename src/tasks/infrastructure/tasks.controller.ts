import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';

import { TasksService } from '../application/tasks.service';
import { Task } from '../domain/task.entity';
import { CreateTaskDto } from '../domain/dto/create-task.dto';
import { GetTasksFilterDto } from '../domain/dto/get-tasks-filter.dto';
import { UpdateTaskDto } from '../domain/dto/update-task.dto';
import { UpdateTaskStatusDto } from '../domain/dto/update-task-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/domain/get-user.decorator';
import { User } from 'src/auth/domain/user.entity';
import { ConfigService } from '@nestjs/config';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger('TasksController');

  constructor(
    private tasksService: TasksService,
    private configServide: ConfigService,
  ) {
    console.log(configServide.get('TEST_VALUE'));
  }

  @Get()
  getTasks(
    @GetUser() user: User,
    @Query() filterDto: GetTasksFilterDto,
  ): Promise<Task[]> {
    this.logger.verbose(
      `User "${user.username}" retrieving all tasks. Filters: ${JSON.stringify(
        filterDto,
      )}`,
    );
    return this.tasksService.getTasks(user, filterDto);
  }

  @Get('/:id')
  getTaskById(@GetUser() user: User, @Param('id') id: string): Promise<Task> {
    return this.tasksService.getTaskById(user, id);
  }

  @Post()
  createTask(
    @GetUser() user: User,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    this.logger.verbose(
      `User "${user.username}" creating a new task. Data: ${JSON.stringify(
        createTaskDto,
      )}`,
    );
    return this.tasksService.createTask(user, createTaskDto);
  }

  @Patch('/:id')
  updateTask(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<UpdateResult> {
    this.logger.verbose(
      `User "${
        user.username
      }" updating task. id: "${id}" Data: ${JSON.stringify(updateTaskDto)}`,
    );
    return this.tasksService.updateTask(user, id, updateTaskDto);
  }

  @Delete('/:id')
  deleteTask(
    @GetUser() user: User,
    @Param('id') id: string,
  ): Promise<DeleteResult> {
    this.logger.verbose(`User "${user.username}" deleting task. id: "${id}"`);
    return this.tasksService.deleteTask(user, id);
  }

  @Patch('/:id/status')
  updateTaskStatus(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<Task> {
    this.logger.verbose(
      `User "${
        user.username
      }" updating status task. id: "${id}" Data: ${JSON.stringify(
        updateTaskStatusDto,
      )}`,
    );
    return this.tasksService.updateTaskStatus(user, id, updateTaskStatusDto);
  }
}
