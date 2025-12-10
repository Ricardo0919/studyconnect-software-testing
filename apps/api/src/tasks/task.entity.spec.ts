/// <reference types="jest" />
import { Task } from './task.entity';
import { TaskStatus } from '../common/enums/task-status.enum';
import { TaskPriority } from '../common/enums/task-priority.enum';

describe('Task entity (domain)', () => {
  it('creates with minimal valid data', () => {
    const t = new Task();
    t.title = 'HW';
    expect(t.title).toBe('HW');

    expect(t.status).toBe(TaskStatus.OPEN);
    expect(t.priority).toBe(TaskPriority.MEDIUM);
  });

  it('allows valid status transitions', () => {
    const t = new Task();
    t.status = TaskStatus.OPEN;
    t.setStatus(TaskStatus.IN_PROGRESS);
    t.setStatus(TaskStatus.BLOCKED);
    t.setStatus(TaskStatus.IN_PROGRESS);
    t.setStatus(TaskStatus.COMPLETED);
    expect(t.status).toBe(TaskStatus.COMPLETED);
  });

  it('rejects invalid transition OPEN -> COMPLETED', () => {
    const t = new Task();
    t.status = TaskStatus.OPEN;
    expect(() => t.setStatus(TaskStatus.COMPLETED)).toThrow(
      /Invalid status transition/,
    );
  });

  it('rejects other invalid transitions according to state machine', () => {
    const t = new Task();
    t.status = TaskStatus.BLOCKED;
    expect(() => t.setStatus(TaskStatus.COMPLETED)).toThrow(
      /Invalid status transition/,
    );

    t.status = TaskStatus.COMPLETED;
    expect(() => t.setStatus(TaskStatus.IN_PROGRESS)).toThrow(
      /Invalid status transition/,
    );
  });

  it('isOverdue: true when past due and not completed', () => {
    const t = new Task();
    t.status = TaskStatus.IN_PROGRESS;
    t.dueDate = new Date(Date.now() - 5_000);
    expect(t.isOverdue()).toBe(true);
  });

  it('isOverdue: false when completed even if past due', () => {
    const t = new Task();
    t.status = TaskStatus.COMPLETED;
    t.dueDate = new Date(Date.now() - 5_000);
    expect(t.isOverdue()).toBe(false);
  });

  it('isOverdue: false when no due date', () => {
    const t = new Task();
    t.status = TaskStatus.OPEN;
    expect(t.isOverdue()).toBe(false);
  });

  it('isOverdue: boundary at now vs future', () => {
    const now = Date.now();
    const tPast = new Task();
    tPast.status = TaskStatus.IN_PROGRESS;
    tPast.dueDate = new Date(now - 1);
    expect(tPast.isOverdue()).toBe(true);

    const tFuture = new Task();
    tFuture.status = TaskStatus.IN_PROGRESS;
    tFuture.dueDate = new Date(now + 1);
    expect(tFuture.isOverdue()).toBe(false);
  });
});
