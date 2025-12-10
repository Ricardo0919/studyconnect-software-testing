/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserAchievement } from './user-achievement.entity';
import { createMockRepo } from '../../test/test-utils';
import { UsersService } from '../users/users.service';

describe('GamificationService', () => {
  let service: GamificationService;

  const usersServiceMock = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        {
          provide: getRepositoryToken(UserAchievement),
          useValue: createMockRepo(),
        },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    service = module.get(GamificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
