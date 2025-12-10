import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
  Req,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-status.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import type { Task } from './task.entity';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { TaskStatus } from '../common/enums/task-status.enum';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      validationError: { target: false, value: false },
    }),
  )
  async create(@Req() req: any, @Body() dto: CreateTaskDto) {
    const creatorId = dto.creatorId ?? req?.user?.id;
    return this.tasks.create({ ...dto, creatorId });
  }

  @Patch(':id')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
      validationError: { target: false, value: false },
    }),
  )
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.updateTask(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasks.deleteTask(id);
  }

  @Get()
  findAll() {
    return this.tasks.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const t = await this.tasks.findOne(id);
    if (!t) return null;

    console.log(
      'controller.findOne: loaded task assignees ->',
      (t as any).assignees?.map((a: any) => ({
        id: a.id,
        user: a.user && { id: a.user.id, email: a.user.email },
      })),
    );

    const status = (t as any).status ?? (t as any).state ?? '';

    const assignee = pickAssigneeEmail(t);

    const group = t?.group
      ? { id: (t as any).group?.id, name: (t as any).group?.name }
      : null;
    const creator = t?.creator
      ? { id: (t as any).creator?.id, email: (t as any).creator?.email }
      : null;

    return {
      id: (t as any).id,
      title: (t as any).title ?? (t as any).name ?? '',
      notes: (t as any).notes ?? null,
      status: String(status).toUpperCase(),
      priority: (t as any).priority ?? null,
      dueDate: (t as any).dueDate ?? null,
      group,
      category: (t as any).category ?? null,
      creator,
      assignee,
      assignees:
        (t as any).assignees?.map((a: any) => a?.user?.email).filter(Boolean) ??
        [],
    };
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() body: UpdateTaskStatusDto) {
    const normalized = (body.status as any)
      .toString()
      .toUpperCase()
      .replace(/\s+/g, '_') as TaskStatus;
    return this.tasks.setStatus(id, normalized);
  }
  @Post(':id/status')
  setStatus(@Param('id') id: string, @Body() body: UpdateTaskStatusDto) {
    const normalized = (body.status as any)
      .toString()
      .toUpperCase()
      .replace(/\s+/g, '_') as TaskStatus;
    return this.tasks.setStatus(id, normalized);
  }

  @Post(':id/assign/:userId')
  async assign(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    const currentUserEmail = req?.user?.email ?? req?.user?.username ?? '';
    const currentUserId = req?.user?.id ?? undefined;

    const task = await this.tasks.findOne(id);
    if (!task?.group?.id) throw new NotFoundException('Task not found');

    const assigneeEmail = await this.tasks.resolveUserEmailById(userId);

    return this.tasks.assignTask(
      task.group.id,
      id,
      assigneeEmail,
      currentUserEmail,
      currentUserId,
    );
  }

  @Post(':id/unassign/:userId')
  unassign(@Param('id') id: string, @Param('userId') userId: string) {
    return this.tasks.unassign(id, userId);
  }

  @Post('evaluate-overdue')
  evaluateOverdue(@Body('now') now?: string) {
    return this.tasks.evaluateOverdue(new Date(now ?? Date.now()));
  }

  @Patch('groups/:groupId/tasks/:taskId/assignee')
  async assignInGroup(
    @Param('groupId') groupId: string,
    @Param('taskId') taskId: string,
    @Body() body: AssignTaskDto,
    @Req() req: any,
  ) {
    console.log('controller.assignInGroup: START', {
      route: `PATCH /groups/${groupId}/tasks/${taskId}/assignee`,
      body,
      user: {
        id: req?.user?.id,
        email: req?.user?.email ?? req?.user?.username,
      },
    });

    try {
      const currentUserEmail = req?.user?.email ?? req?.user?.username ?? '';
      const currentUserId = req?.user?.id ?? undefined;

      console.log('controller.assignInGroup: calling service.assignTask', {
        groupId,
        taskId,
        assigneeEmail: body.assignee,
        currentUserEmail,
        currentUserId,
      });

      const result = await this.tasks.assignTask(
        groupId,
        taskId,
        body.assignee,
        currentUserEmail,
        currentUserId,
      );

      console.log('controller.assignInGroup: service call successful', {
        taskId: result?.id,
        assignees: result?.assignees?.map((a: any) => ({
          id: a.id,
          userId: a.userId,
          email: a.user?.email,
        })),
      });

      return result;
    } catch (error) {
      console.error('controller.assignInGroup: ERROR', {
        error: error.message,
        stack: error.stack,
        code: error.code,
        status: error.status,
      });
      throw error;
    }
  }
}

function pickAssigneeEmail(t: any): string | null {
  const direct = t?.assignee?.email ?? t?.assignee;
  if (typeof direct === 'string') return direct;

  if (Array.isArray(t?.assignees)) {
    const hit = t.assignees.find((a: any) => a?.user?.email);
    if (hit?.user?.email) return hit.user.email;
  }
  return null;
}
