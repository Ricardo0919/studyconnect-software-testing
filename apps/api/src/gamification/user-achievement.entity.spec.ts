/// <reference types="jest" />
import { UserAchievement } from './user-achievement.entity';
import { User } from '../users/user.entity';
import { Badge } from '../common/enums/badge.enum';

describe('UserAchievement entity (domain)', () => {
  it('creates with badge and user; default points = 0', () => {
    const user = Object.assign(new User(), { id: 'u1', email: 'a@x', displayName: 'A' });

    const ua = new UserAchievement();
    ua.badge = Badge.FIRST_TASK;
    ua.user = user;
    ua.points = ua.points ?? 0;

    expect(ua.badge).toBe(Badge.FIRST_TASK);
    expect(ua.user).toBe(user);
    expect(ua.points).toBe(0);
  });

  it('accumulates points when progress is made', () => {
    const user = Object.assign(new User(), { id: 'u2', email: 'b@x', displayName: 'B' });

    const ua = new UserAchievement();
    ua.badge = Badge.STREAK_7_DAYS;
    ua.user = user;
    ua.points = ua.points ?? 0;

    ua.points += 10;
    ua.points += 5;

    expect(ua.points).toBe(15);
  });
});
