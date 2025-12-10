import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TaskStatus } from '../common/enums/task-status.enum';
import { TaskPriority } from '../common/enums/task-priority.enum';
import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';
import { TaskAssignment } from './task-assignment.entity';
import { Category } from '../categories/category.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() title: string;

  @Column({ type: 'text', nullable: true }) notes?: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.OPEN })
  status: TaskStatus = TaskStatus.OPEN;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority = TaskPriority.MEDIUM;

  @Column({ type: 'timestamptz', nullable: true }) dueDate?: Date;

  @ManyToOne(() => User, (u) => u.createdTasks, { eager: true })
  creator: User;

  @ManyToOne(() => Group, (g) => g.tasks, { nullable: true, eager: true })
  group?: Group;

  @ManyToOne(() => Category, (c) => c.tasks, { nullable: true, eager: true })
  category?: Category;

  @OneToMany(() => TaskAssignment, (a) => a.task, {
    cascade: true,
    eager: true,
  })
  assignees: TaskAssignment[];

  get assignee() {
    if (!this.assignees?.length) return null;
    const active = this.assignees.filter((a) => a.active);
    return active.length > 0 ? active[0].user : null;
  }

  toJSON() {
    const json: Record<string, any> = {
      id: this.id,
      title: this.title,
      notes: this.notes,
      status: this.status,
      priority: this.priority,
      dueDate: this.dueDate,
      group: this.group,
      category: this.category,
      creator: this.creator,
    };

    const active = (this.assignees || []).filter((a) => a.active);
    const latest = active.length > 0 ? active[0].user : null;

    json.assignee = latest?.email;
    json.assignees = active.map((a) => a.user?.email).filter(Boolean);

    return json;
  }

  setStatus(next: TaskStatus): TaskStatus {
    const allowed = new Map<TaskStatus, TaskStatus[]>([
      [TaskStatus.OPEN, [TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED]],
      [TaskStatus.IN_PROGRESS, [TaskStatus.BLOCKED, TaskStatus.COMPLETED]],
      [TaskStatus.BLOCKED, [TaskStatus.IN_PROGRESS]],
      [TaskStatus.COMPLETED, []],
      [TaskStatus.OVERDUE, [TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]],
    ]);

    const allowedTransitions = allowed.get(this.status);
    if (!allowedTransitions) {
      throw new Error(`Unknown current status: ${this.status}`);
    }
    if (!allowedTransitions.includes(next)) {
      throw new Error(`Invalid status transition: ${this.status} → ${next}`);
    }

    this.status = next;
    return this.status;
  }

  isOverdue(now = new Date()): boolean {
    return (
      !!this.dueDate &&
      this.status !== TaskStatus.COMPLETED &&
      this.dueDate.getTime() < now.getTime()
    );
  }
}
