import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Task } from './task.entity';

@Entity('task_assignment')
export class TaskAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.assignments, {
    eager: true,
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Task, (t) => t.assignees, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ default: true })
  active: boolean;
}
