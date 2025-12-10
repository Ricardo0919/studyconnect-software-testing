import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from '../tasks/task.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true }) name: string;

  @Column({ nullable: true }) description?: string;

  @OneToMany(() => Task, (t) => t.category) tasks: Task[];
}
