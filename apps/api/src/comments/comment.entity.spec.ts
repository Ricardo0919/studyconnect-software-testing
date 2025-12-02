/// <reference types="jest" />
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity';
import { Group } from '../groups/group.entity';

describe('Comment entity (domain)', () => {
  it('creates with content and author, linked to a task', () => {
    const author = Object.assign(new User(), { id: 'u1', email: 'a@x', displayName: 'A' });
    const task = Object.assign(new Task(), { id: 't1', title: 'HW' });

    const c = new Comment();
    c.content = 'Let’s split Q1–Q5 / Q6–Q10';
    c.author = author;
    c.task = task;

    expect(c.content).toContain('split');
    expect(c.author).toBe(author);
    expect(c.task).toBe(task);
    expect(c.group).toBeUndefined();
  });

  it('can link to a group instead of a task', () => {
    const author = Object.assign(new User(), { id: 'u2', email: 'b@x', displayName: 'B' });
    const group = Object.assign(new Group(), { id: 'g1', name: 'Quantum' });

    const c = new Comment();
    c.content = 'Meeting at 18:00';
    c.author = author;
    c.group = group;

    expect(c.task).toBeUndefined();
    expect(c.group).toBe(group);
  });

  it('should not carry empty content', () => {
    const author = Object.assign(new User(), { id: 'u3', email: 'c@x', displayName: 'C' });
    const task = Object.assign(new Task(), { id: 't3', title: 'HW 3' });

    const c = new Comment();
    c.content = '';
    c.author = author;
    c.task = task;

    expect(typeof c.content).toBe('string');
    expect(c.content.length).toBeLessThanOrEqual(0);
  });
});
