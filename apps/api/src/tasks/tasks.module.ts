import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskAssignment } from './task-assignment.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { UsersModule } from '../users/users.module';
import { GroupsModule } from '../groups/groups.module';
import { CategoriesModule } from '../categories/categories.module';
import { GroupTasksController } from './group-tasks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskAssignment]),
    UsersModule,
    GroupsModule,
    CategoriesModule,
  ],
  providers: [TasksService],
  controllers: [TasksController, GroupTasksController],
  exports: [TypeOrmModule, TasksService],
})
export class TasksModule {}
