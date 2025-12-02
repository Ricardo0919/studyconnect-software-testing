/// <reference types="jest" />
import { User } from './user.entity';
import { UserRole } from '../common/enums/user-role.enum';

describe('User entity (domain)', () => {
  it('creates with email, displayName and defaults role to STUDENT', () => {
    const u = new User();
    u.email = 'alice@example.com';
    u.displayName = 'Alice';
    expect(u.email).toMatch(/@/);
    expect(u.displayName.length).toBeGreaterThan(0);
    expect(u.role).toBe(UserRole.STUDENT);
  });

  it('hashes and verifies passwords deterministically', () => {
    const u = new User();
    u.setPassword('StrongPass1!');
    expect(u.passwordHash).toMatch(/^[a-f0-9]{64}$/);
    expect(u.verifyPassword('StrongPass1!')).toBe(true);
    expect(u.verifyPassword('wrong')).toBe(false);
  });
});
