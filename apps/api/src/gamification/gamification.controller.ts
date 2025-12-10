import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { Badge } from '../common/enums/badge.enum';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamification: GamificationService) {}

  @Post('award/:userId')
  award(
    @Param('userId') userId: string,
    @Body() body: { badge: Badge; points?: number },
  ) {
    return this.gamification.awardBadge(userId, body.badge, body.points ?? 10);
  }

  @Get('user/:userId')
  byUser(@Param('userId') userId: string) {
    return this.gamification.getByUser(userId);
  }
}
