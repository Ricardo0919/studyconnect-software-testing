/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';

describe('GamificationController', () => {
  let controller: GamificationController;

  const gamificationServiceMock = {
    awardBadge: jest.fn(),
    getByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamificationController],
      providers: [
        { provide: GamificationService, useValue: gamificationServiceMock },
      ],
    }).compile();

    controller = module.get(GamificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
