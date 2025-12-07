import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private readonly repo: Repository<Group>,
    private readonly users: UsersService,
  ) {}

  async create(name: string, description: string | undefined, ownerId: string) {
    const owner = await this.users.findOne(ownerId);
    if (!owner) throw new NotFoundException('Owner not found');
    return this.repo.save(
      this.repo.create({ name, description, owner, members: [owner] }),
    );
  }

  findAll() {
    return this.repo.find();
  }
  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async addMember(groupId: string, userId: string) {
    const [g, u] = await Promise.all([
      this.findOne(groupId),
      this.users.findOne(userId),
    ]);
    if (!g || !u) throw new NotFoundException('Group or User not found');
    g.addMember(u);
    return this.repo.save(g);
  }

  async removeMember(groupId: string, userId: string) {
    const g = await this.findOne(groupId);
    if (!g) throw new NotFoundException('Group not found');
    g.removeMember(userId);
    return this.repo.save(g);
  }
}
