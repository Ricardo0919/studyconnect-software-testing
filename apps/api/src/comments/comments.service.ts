import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Comment } from './comment.entity';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly repo: Repository<Comment>,
    private readonly users: UsersService,
    private readonly tasks: TasksService,
    private readonly groups: GroupsService,
  ) {}

  async create(dto: {
    content: string;
    authorId: string;
    taskId?: string;
    groupId?: string;
  }) {
    const author = await this.users.findOne(dto.authorId);
    if (!author) throw new NotFoundException('Author not found');
    if (!dto.taskId && !dto.groupId)
      throw new BadRequestException('taskId or groupId required');

    const rawTask = dto.taskId
      ? await this.tasks.findOne(dto.taskId)
      : undefined;
    const task = rawTask ?? undefined;

    const rawGroup = dto.groupId
      ? await this.groups.findOne(dto.groupId)
      : undefined;
    const group = rawGroup ?? undefined;

    const payload: DeepPartial<Comment> = {
      content: dto.content,
      author,
      task,
      group,
    };

    return this.repo.save(this.repo.create(payload));
  }

  findForTask(taskId: string) {
    return this.repo.find({ where: { task: { id: taskId } } as any });
  }
  findForGroup(groupId: string) {
    return this.repo.find({ where: { group: { id: groupId } } as any });
  }
}
