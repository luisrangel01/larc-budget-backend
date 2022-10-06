import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';

import { Task } from '../domain/task.entity';
import { TasksRepositoryService } from '../domain/tasks.repository';
import { CreateTaskDto } from '../domain/dto/create-task.dto';
import { UpdateTaskDto } from '../domain/dto/update-task.dto';
import { GetTasksFilterDto } from '../domain/dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from '../domain/dto/update-task-status.dto';
import { User } from 'src/auth/domain/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @Inject(TasksRepositoryService)
    private readonly tasksRepositoryService: TasksRepositoryService,
  ) {}

  getTasks(user: User, filterDto: GetTasksFilterDto): Promise<Task[]> {
    return this.tasksRepositoryService.getTasks(user, filterDto);
  }

  async getTaskById(user: User, id: string): Promise<Task> {
    const found = await this.tasksRepositoryService.findOne({
      where: { id, user },
    });
    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return found;
  }

  createTask(user: User, createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksRepositoryService.createTask(user, createTaskDto);
  }

  async updateTask(
    user: User,
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<UpdateResult> {
    const result = await this.tasksRepositoryService.updateTask(
      user,
      id,
      updateTaskDto,
    );
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return result;
  }

  async deleteTask(user: User, id: string): Promise<DeleteResult> {
    const result = await this.tasksRepositoryService.deleteTask(user, id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return result;
  }

  async updateTaskStatus(
    user: User,
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<Task> {
    const task = await this.getTaskById(user, id);

    task.status = updateTaskStatusDto.status;

    await this.tasksRepositoryService.repository.save(task);

    return task;
  }
}
