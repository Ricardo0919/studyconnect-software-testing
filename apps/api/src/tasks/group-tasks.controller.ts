import { Controller, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AssignTaskDto } from './dto/assign-task.dto';

@Controller('groups')
export class GroupTasksController {
  constructor(private readonly tasks: TasksService) {}

  @Patch(':groupId/tasks/:taskId/assignee')
  assignByEmail(
    @Param('groupId') groupId: string,
    @Param('taskId') taskId: string,
    @Body() dto: AssignTaskDto,
    @Req() req: any,
  ) {
    const currentEmail = req?.user?.email ?? 'alice@uni.de';
    console.log('GroupTasksController.assignByEmail called', {
      groupId,
      taskId,
      assignee: dto.assignee,
      currentEmail,
    });
    return this.tasks.assignTask(groupId, taskId, dto.assignee, currentEmail);
  }

  @Delete(':groupId/tasks/:taskId/assignee')
  unassignByEmail(
    @Param('groupId') groupId: string,
    @Param('taskId') taskId: string,
    @Req() req: any,
  ) {
    return this.tasks.unassign(taskId, req?.user?.id ?? 'bob-id');
  }
}
