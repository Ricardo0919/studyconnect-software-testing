import { DataSource } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { Group } from '../groups/group.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { Task } from '../tasks/task.entity';
import { TaskAssignment } from '../tasks/task-assignment.entity';
import { Category } from '../categories/category.entity';
import { Comment } from '../comments/comment.entity';
import { UserAchievement } from '../gamification/user-achievement.entity';
import { newDb, DataType } from 'pg-mem';
import { randomUUID } from 'crypto';

describe('UserRepository (integration)', () => {
  let dataSource: DataSource;
  let repo: UserRepository;

  beforeEach(async () => {
    const db = newDb({ autoCreateForeignKeyIndices: true });
    db.public.registerFunction({
      name: 'version',
      returns: DataType.text,
      implementation: () => 'pg-mem',
    });
    db.public.registerFunction({
      name: 'current_database',
      returns: DataType.text,
      implementation: () => 'pg-mem',
    });
    db.public.registerFunction({
      name: 'uuid_generate_v4',
      returns: DataType.uuid,
      implementation: () => randomUUID(),
      impure: true,
    });
    dataSource = await db.adapters.createTypeormDataSource({
      type: 'postgres',
      entities: [
        User,
        Group,
        Task,
        TaskAssignment,
        Category,
        Comment,
        UserAchievement,
      ],
      synchronize: true,
    });
    await dataSource.initialize();
    repo = new UserRepository(dataSource);
  });

  afterEach(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('creates users and finds them by id/email', async () => {
    const created = await repo.createUser({
      email: 'Alice@Example.com',
      displayName: 'Alice',
      passwordHash: User.hashPassword('StrongPass1!'),
    });
    expect(created.id).toBeDefined();

    const byId = await repo.findById(created.id);
    const byEmail = await repo.findByEmail('ALICE@example.com');

    expect(byId?.email).toBe('alice@example.com');
    expect(byEmail?.id).toBe(created.id);
  });

  it('updates user fields', async () => {
    const created = await repo.createUser({
      email: 'edit@example.com',
      displayName: 'Old',
      passwordHash: User.hashPassword('StrongPass1!'),
    });
    const updated = await repo.updateUser(created.id, {
      displayName: 'New',
      role: UserRole.ADMIN,
    });

    expect(updated?.displayName).toBe('New');
    expect(updated?.role).toBe(UserRole.ADMIN);
  });

  it('deletes users', async () => {
    const created = await repo.createUser({
      email: 'delete@example.com',
      displayName: 'Delete',
      passwordHash: User.hashPassword('StrongPass1!'),
    });
    const affected = await repo.deleteUser(created.id);
    expect(affected).toBe(1);
    expect(await repo.findById(created.id)).toBeNull();
  });

  it('queries users by role', async () => {
    await repo.createUser({
      email: 'student@example.com',
      displayName: 'Student',
      passwordHash: User.hashPassword('StrongPass1!'),
    });
    await repo.createUser({
      email: 'admin@example.com',
      displayName: 'Admin',
      role: UserRole.ADMIN,
      passwordHash: User.hashPassword('StrongPass1!'),
    });

    const admins = await repo.findByRole(UserRole.ADMIN);
    expect(admins.map((a) => a.email)).toContain('admin@example.com');
    expect(admins.map((a) => a.email)).not.toContain('student@example.com');
  });

  it('finds users by team membership', async () => {
    const owner = await repo.createUser({
      email: 'owner@example.com',
      displayName: 'Owner',
      passwordHash: User.hashPassword('StrongPass1!'),
    });
    const member = await repo.createUser({
      email: 'member@example.com',
      displayName: 'Member',
      passwordHash: User.hashPassword('StrongPass1!'),
    });

    const groupRepo = dataSource.getRepository(Group);
    const group = groupRepo.create({
      name: 'Group A',
      owner,
      members: [owner],
    });
    const savedGroup = await groupRepo.save(group);

    await repo.addUserToGroup(member, savedGroup.id);

    const members = await repo.findByTeamMembership(savedGroup.id);
    const emails = members.map((m) => m.email);

    expect(emails).toEqual(
      expect.arrayContaining(['owner@example.com', 'member@example.com']),
    );
  });
});
