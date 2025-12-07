/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskAssignment } from './task-assignment.entity';
import { createMockRepo } from '../../test/test-utils';
import { UsersService } from '../users/users.service';
import { GroupsService } from '../groups/groups.service';
import { CategoriesService } from '../categories/categories.service';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';

describe('TasksService', () => {
  let service: TasksService;

  const usersServiceMock = { findOne: jest.fn() };
  const groupsServiceMock = { findOne: jest.fn() };
  const categoriesServiceMock = { findOne: jest.fn() };

  const taskRepoMock = createMockRepo();
  const assignmentRepoMock = createMockRepo();
  const userRepoMock = createMockRepo();

  const dataSourceMock: Partial<DataSource> = {
    transaction: jest.fn(async (cb: any) => {
      const manager = {
        getRepository: (entity: any) => {
          if (entity === Task) return taskRepoMock;
          if (entity === TaskAssignment) return assignmentRepoMock;
          if (entity === User) return userRepoMock;
          return createMockRepo();
        },
        save: jest.fn(),
        find: jest.fn(),
      };
      return cb(manager);
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    Object.values(taskRepoMock).forEach((fn: any) => fn?.mockClear?.());
    Object.values(assignmentRepoMock).forEach((fn: any) => fn?.mockClear?.());
    Object.values(userRepoMock).forEach((fn: any) => fn?.mockClear?.());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: taskRepoMock },
        {
          provide: getRepositoryToken(TaskAssignment),
          useValue: assignmentRepoMock,
        },
        { provide: getRepositoryToken(User), useValue: userRepoMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: GroupsService, useValue: groupsServiceMock },
        { provide: CategoriesService, useValue: categoriesServiceMock },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne delega al repo', async () => {
    taskRepoMock.findOne.mockResolvedValue({ id: 't1' });
    const res = await service.findOne('t1');
    expect(res).toEqual({ id: 't1' });
    expect(taskRepoMock.findOne).toHaveBeenCalled();
  });

  it('updateTask updates attributes and returns latest entity', async () => {
    const existing = {
      id: 't1',
      title: 'Old Title',
      notes: 'old',
      priority: 'MEDIUM',
    };
    taskRepoMock.findOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce({ id: 't1', title: 'Updated Title' });
    taskRepoMock.save.mockResolvedValue(existing);

    const dto = {
      title: 'Updated Title',
      dueDate: new Date(Date.now() + 86_400_000).toISOString(),
    };
    const result = await service.updateTask('t1', dto as any);

    expect(taskRepoMock.save).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Updated Title' }),
    );
    expect(result).toEqual({ id: 't1', title: 'Updated Title' });
  });

  it('deleteTask removes a task via repository delete', async () => {
    taskRepoMock.delete.mockResolvedValue({ affected: 1 });
    const result = await service.deleteTask('t1');
    expect(taskRepoMock.delete).toHaveBeenCalledWith({ id: 't1' });
    expect(result).toEqual({ deleted: true });
  });
});
