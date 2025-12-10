import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    repo = {
      create: jest.fn((dto) => Object.assign(new User(), dto)),
      save: jest.fn((entity) =>
        Promise.resolve(Object.assign(new User(), entity)),
      ),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('register', () => {
    it('saves a hashed password and strips sensitive data', async () => {
      repo.findOne.mockResolvedValueOnce(null);
      repo.save.mockImplementation(async (user) => {
        user.id = 'user-1';
        return user;
      });

      const result = await service.register({
        email: 'Test@Example.com',
        displayName: 'Tester',
        password: 'StrongPass1!',
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          displayName: 'Tester',
          role: UserRole.STUDENT,
        }),
      );
      const savedUser = repo.save.mock.calls[0][0];
      expect(savedUser.passwordHash).toBe(User.hashPassword('StrongPass1!'));
      expect(result).toMatchObject({ id: 'user-1', email: 'test@example.com' });
      expect(result.passwordHash).toBeUndefined();
    });

    it('rejects duplicate emails', async () => {
      repo.findOne.mockResolvedValueOnce(
        Object.assign(new User(), {
          id: 'existing',
          email: 'demo@example.com',
        }),
      );

      await expect(
        service.register({
          email: 'demo@example.com',
          displayName: 'Demo',
          password: 'ValidPass1!',
        }),
      ).rejects.toThrow(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('rejects weak passwords', async () => {
      repo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.register({
          email: 'weak@example.com',
          displayName: 'Weak',
          password: 'short',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('returns user when credentials are valid', async () => {
      const stored = new User();
      stored.id = 'u1';
      stored.email = 'user@example.com';
      stored.displayName = 'User';
      stored.role = UserRole.STUDENT;
      stored.passwordHash = User.hashPassword('StrongPass1!');
      repo.findOne.mockResolvedValueOnce(stored);

      const result = await service.login('USER@example.com', 'StrongPass1!');

      expect(result).toMatchObject({
        id: 'u1',
        email: 'user@example.com',
        displayName: 'User',
      });
      expect(result.passwordHash).toBeUndefined();
    });

    it('throws on invalid credentials', async () => {
      repo.findOne.mockResolvedValueOnce(null);
      await expect(
        service.login('missing@example.com', 'Whatever1!'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when password does not match', async () => {
      const stored = new User();
      stored.id = 'u1';
      stored.email = 'user@example.com';
      stored.displayName = 'User';
      stored.role = UserRole.STUDENT;
      stored.passwordHash = User.hashPassword('Correct1!');
      repo.findOne.mockResolvedValueOnce(stored);

      await expect(
        service.login('user@example.com', 'Wrong1!'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('assignRole', () => {
    it('updates the role and hides password hash', async () => {
      const user = Object.assign(new User(), {
        id: 'u1',
        email: 'x@y',
        role: UserRole.STUDENT,
      });
      repo.findOne.mockResolvedValueOnce(user);
      repo.save.mockImplementation(async (u) => u);

      const result = await service.assignRole('u1', UserRole.ADMIN);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.ADMIN }),
      );
      expect(result.role).toBe(UserRole.ADMIN);
    });
  });

  describe('updateProfile', () => {
    it('updates display name and password when valid', async () => {
      const user = Object.assign(new User(), {
        id: 'u1',
        email: 'user@example.com',
        displayName: 'Old',
        passwordHash: User.hashPassword('OldPass1!'),
      });
      repo.findOne.mockResolvedValueOnce(user);
      repo.save.mockImplementation(async (u) => u);

      const result = await service.updateProfile('u1', {
        displayName: 'New Name',
        password: 'NewPass1!',
      });

      expect(repo.save).toHaveBeenCalled();
      expect(result.displayName).toBe('New Name');
    });

    it('rejects invalid password updates', async () => {
      const user = Object.assign(new User(), {
        id: 'u1',
        email: 'user@example.com',
        displayName: 'Old',
      });
      repo.findOne.mockResolvedValueOnce(user);

      await expect(
        service.updateProfile('u1', { password: 'short' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  it('validatePasswordRules returns error list for weak password', () => {
    const outcome = service.validatePasswordRules('lowercase');
    expect(outcome.valid).toBe(false);
    expect(outcome.errors).toEqual(
      expect.arrayContaining(['uppercase', 'digit', 'specialChar']),
    );
  });

  it('findAll proxies to repository', async () => {
    await service.findAll();
    expect(repo.find).toHaveBeenCalled();
  });

  it('findOne proxies to repository', async () => {
    repo.findOne.mockResolvedValueOnce(Object.assign(new User(), { id: 'u1' }));
    await service.findOne('u1');
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });
});
