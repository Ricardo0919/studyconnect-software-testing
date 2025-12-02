import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { Group } from '../groups/group.entity';

@Injectable()
export class UserRepository {
  private readonly repo: Repository<User>;
  private readonly groupRepo: Repository<Group>;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    this.repo = dataSource.getRepository(User);
    this.groupRepo = dataSource.getRepository(Group);
  }

  createUser(data: Partial<User> & { passwordHash: string }) {
    const entity = this.repo.create({
      ...data,
      email: data.email ? this.normalizeEmail(data.email) : undefined,
    });
    return this.repo.save(entity);
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email: this.normalizeEmail(email) } });
  }

  async updateUser(id: string, updates: Partial<User>) {
    await this.repo.update(id, updates);
    return this.findById(id);
  }

  async deleteUser(id: string) {
    const result = await this.repo.delete(id);
    return result.affected ?? 0;
  }

  findByRole(role: UserRole) {
    return this.repo.find({ where: { role } });
  }

  async findByTeamMembership(groupId: string) {
    return this.repo
      .createQueryBuilder('user')
      .innerJoin('user.groups', 'group', 'group.id = :groupId', { groupId })
      .getMany();
  }

  async addUserToGroup(user: User, groupId: string) {
    const group = await this.groupRepo.findOne({ where: { id: groupId }, relations: ['members'] });
    if (!group) return null;
    group.addMember(user);
    await this.groupRepo.save(group);
    return group;
  }

  private normalizeEmail(email: string) {
    return String(email ?? '').trim().toLowerCase();
  }
}
