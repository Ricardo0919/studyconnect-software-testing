import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Badge } from '../common/enums/badge.enum';

@Entity()
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, (u) => u.achievements, { eager: true })
  user: User;

  @Column({ type: 'enum', enum: Badge }) badge: Badge;

  @Column({ default: 0 }) points: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  awardedAt: Date;
}
