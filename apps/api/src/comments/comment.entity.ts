// src/comments/comment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity';
import { Group } from '../groups/group.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ type: 'text' }) content: string;

  @ManyToOne(() => User, (u) => u.comments, { eager: true })
  author: User;

  @ManyToOne(() => Task, { nullable: true }) task?: Task;

  @ManyToOne(() => Group, { nullable: true }) group?: Group;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
