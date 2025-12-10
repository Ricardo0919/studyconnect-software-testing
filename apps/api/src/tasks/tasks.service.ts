import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, In } from 'typeorm';
import { Task } from './task.entity';
import { TaskAssignment } from './task-assignment.entity';
import { UsersService } from '../users/users.service';
import { GroupsService } from '../groups/groups.service';
import { CategoriesService } from '../categories/categories.service';
import { TaskStatus } from '../common/enums/task-status.enum';
import { TaskPriority } from '../common/enums/task-priority.enum';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';

const ALLOWED: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.OPEN]: [TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.BLOCKED, TaskStatus.COMPLETED],
  [TaskStatus.BLOCKED]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.COMPLETED]: [],
  [TaskStatus.OVERDUE]: [TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED],
};

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(TaskAssignment)
    private readonly assignments: Repository<TaskAssignment>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly users: UsersService,
    private readonly groups: GroupsService,
    private readonly categories: CategoriesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: {
    title: string;
    notes?: string;
    priority?: TaskPriority;
    dueDate?: string;
    creatorId: string;
    groupId?: string;
    categoryId?: string;
  }) {
    if (dto.dueDate && new Date(dto.dueDate) < new Date()) {
      throw new BadRequestException('Due date is in the past');
    }

    const creator = await this.users.findOne(dto.creatorId);
    if (!creator) throw new NotFoundException('Creator not found');

    let group = undefined as typeof this.groups extends any ? any : never;
    if (dto.groupId) {
      const g = await this.groups.findOne(dto.groupId);
      if (!g) throw new NotFoundException('Group not found');
      group = g;
    }

    let category = undefined as typeof this.categories extends any
      ? any
      : never;
    if (dto.categoryId) {
      const c = await this.categories.findOne(dto.categoryId);
      if (!c) throw new NotFoundException('Category not found');
      category = c;
    }

    const payload: DeepPartial<Task> = {
      title: dto.title,
      notes: dto.notes,
      priority: dto.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      creator,
      group: group ?? undefined,
      category: category ?? undefined,
      status: TaskStatus.OPEN,
    };

    const entity = this.tasks.create(payload);
    return this.tasks.save(entity);
  }

  async updateTask(
    id: string,
    dto: {
      title?: string;
      notes?: string;
      priority?: TaskPriority;
      dueDate?: string;
      groupId?: string;
      categoryId?: string;
    },
  ) {
    const task = await this.tasks.findOne({
      where: { id },
      relations: ['group', 'category', 'creator'],
    });
    if (!task) throw new NotFoundException('Task not found');

    if (dto.title) task.title = dto.title;
    if (dto.notes !== undefined) task.notes = dto.notes;
    if (dto.priority) task.priority = dto.priority;

    if (dto.dueDate) {
      const due = new Date(dto.dueDate);
      if (due < new Date())
        throw new BadRequestException('Due date is in the past');
      task.dueDate = due;
    }

    if (dto.groupId) {
      const group = await this.groups.findOne(dto.groupId);
      if (!group) throw new NotFoundException('Group not found');
      task.group = group;
    }

    if (dto.categoryId) {
      const category = await this.categories.findOne(dto.categoryId);
      if (!category) throw new NotFoundException('Category not found');
      task.category = category;
    }

    await this.tasks.save(task);
    return this.findOne(id);
  }

  async deleteTask(id: string) {
    const result = await this.tasks.delete({ id });
    if (!result.affected) throw new NotFoundException('Task not found');
    return { deleted: true };
  }

  findAll() {
    return this.tasks.find();
  }

  async findOne(id: string) {
    const t = await this.tasks.findOne({
      where: { id },
      relations: [
        'assignees',
        'assignees.user',
        'group',
        'creator',
        'category',
        'group.owner',
        'group.members',
      ],
    });

    if (!t) return null;

    const assignments = await this.assignments.find({
      where: { task: { id } },
      relations: ['user'],
      order: { assignedAt: 'DESC' },
    });

    t.assignees = assignments;

    return t;
  }

  async assign(taskId: string, userId: string) {
    const [t, u] = await Promise.all([
      this.findOne(taskId),
      this.users.findOne(userId),
    ]);
    if (!t || !u) throw new NotFoundException('Task or User not found');
    const existing = (t.assignees ?? []).find((a) => a.user.id === u.id);
    if (existing) return t;
    const a = this.assignments.create({ task: t, user: u });
    await this.assignments.save(a);
    return this.findOne(taskId);
  }

  async unassign(taskId: string, userId: string) {
    const t = await this.findOne(taskId);
    if (!t) throw new NotFoundException('Task not found');
    const toRemove = (t.assignees ?? []).find((a) => a.user.id === userId);
    if (toRemove) await this.assignments.remove(toRemove);
    return this.findOne(taskId);
  }

  async assignTask(
    groupId: string,
    taskId: string,
    assigneeEmail: string,
    currentUserEmail: string,
    currentUserId?: string,
  ) {
    return this.assignTaskCore(
      groupId,
      taskId,
      assigneeEmail,
      currentUserEmail,
      currentUserId,
    );
  }

  private async assignTaskCore(
    groupId: string,
    taskId: string,
    assigneeEmail: string,
    currentUserEmail: string,
    currentUserId?: string,
  ) {
    const group = await this.groups.findOne(groupId);
    if (!group) throw new NotFoundException('Group not found');

    const membersRaw = Array.isArray(group.members) ? group.members : [];
    const members = membersRaw.map((m) => ({
      user: (m as any).user ?? m,
      role: (m as any).role ?? (m as any).user?.role,
    }));

    const me =
      members.find((m) => m?.user?.id === currentUserId) ??
      members.find((m) => m?.user?.email === currentUserEmail);
    const meRole = (me?.role ?? me?.user?.role ?? '').toString().toUpperCase();
    const isOwner =
      !!group.owner &&
      (group.owner.id === currentUserId ||
        group.owner.email === currentUserEmail);
    const canAssign = isOwner || meRole === 'ADMIN';
    if (!canAssign) throw new ForbiddenException('Forbidden');

    const assigneeMember = members.find(
      (m) => m?.user?.email === assigneeEmail,
    );
    if (!assigneeMember)
      throw new ForbiddenException('User is not a member of this group');

    const task = await this.tasks.findOne({
      where: { id: taskId },
      relations: [
        'assignees',
        'assignees.user',
        'group',
        'creator',
        'category',
      ],
    });
    if (!task || task.group?.id !== groupId)
      throw new NotFoundException('Task not found');

    if (
      (task.assignees ?? []).some(
        (a) => a?.user?.id === assigneeMember.user.id && a.active !== false,
      )
    ) {
      return this.findOne(taskId);
    }

    await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(TaskAssignment);
      const assignment = repo.create({
        user: assigneeMember.user,
        task,
        active: true,
        assignedAt: new Date(),
      });
      await repo.save(assignment);
    });

    return this.findOne(taskId);
  }

  async setStatus(id: string, next: TaskStatus) {
    const qr = this.tasks.manager.connection.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const task = await qr.manager.findOne(Task, { where: { id } });
      if (!task) throw new NotFoundException('Task not found');

      const current = task.status;
      const allowed = ALLOWED[current] ?? [];

      if (!allowed.includes(next)) {
        throw new BadRequestException('Invalid status transition');
      }

      if (next !== current) {
        task.status = next;
        await qr.manager.save(task);
      }

      await qr.commitTransaction();
      return this.findOne(id);
    } catch (e) {
      if (qr.isTransactionActive) await qr.rollbackTransaction();
      if (e instanceof BadRequestException || e instanceof NotFoundException)
        throw e;
      throw new BadRequestException('Invalid status transition');
    } finally {
      await qr.release();
    }
  }

  async evaluateOverdue(now: Date) {
    const list = await this.tasks.find({
      where: { status: In([TaskStatus.OPEN, TaskStatus.IN_PROGRESS]) },
    });

    const toMark = list.filter((t) => t.dueDate && new Date(t.dueDate) < now);

    for (const t of toMark) {
      t.status = TaskStatus.OVERDUE;
      await this.tasks.save(t);
    }
    return { changed: toMark.length };
  }

  async resolveUserEmailById(userId: string): Promise<string> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user.email;
  }
}
