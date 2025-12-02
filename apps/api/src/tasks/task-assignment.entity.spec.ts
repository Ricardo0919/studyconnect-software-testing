/// <reference types="jest" />
import { TaskAssignment } from './task-assignment.entity';
import { Task } from './task.entity';
import { User } from '../users/user.entity';

describe('TaskAssignment entity (domain)', () => {
  it('creates with task + user; defaults active=true and sets assignedAt', () => {
    const task = Object.assign(new Task(), { id: 't1', title: 'HW' });
    const user = Object.assign(new User(), { id: 'u1', email: 'a@x', displayName: 'A' });

    const a = new TaskAssignment();
    a.task = task;
    a.user = user;
    a.active = a.active ?? true;
    a.assignedAt = a.assignedAt ?? new Date();

    expect(a.task).toBe(task);
    expect(a.user).toBe(user);
    expect(a.active).toBe(true);
    expect(a.assignedAt instanceof Date).toBe(true);
  });

  it('can be deactivated and reactivated', () => {
    const task = Object.assign(new Task(), { id: 't2', title: 'HW 2' });
    const user = Object.assign(new User(), { id: 'u2', email: 'b@x', displayName: 'B' });

    const a = new TaskAssignment();
    a.task = task;
    a.user = user;
    a.active = true;

    a.active = false;
    expect(a.active).toBe(false);

    a.active = true;
    expect(a.active).toBe(true);
  });
});
