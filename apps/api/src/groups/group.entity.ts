import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() name: string;

  @Column({ nullable: true }) description?: string;

  @ManyToOne(() => User, (u) => u.ownedGroups, { eager: true })
  owner: User;

  @ManyToMany(() => User, (u) => u.groups, { eager: true })
  @JoinTable()
  members: User[];

  @OneToMany(() => Task, (t) => t.group) tasks: Task[];

  addMember(user: User) {
    this.members ??= [];
    if (!this.members.find((u) => u.id === user.id)) this.members.push(user);
  }
  removeMember(userId: string) {
    this.members = (this.members ?? []).filter((u) => u.id !== userId);
  }
}
