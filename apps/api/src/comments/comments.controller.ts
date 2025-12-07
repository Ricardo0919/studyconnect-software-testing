import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Post()
  create(
    @Body()
    body: {
      content: string;
      authorId: string;
      taskId?: string;
      groupId?: string;
    },
  ) {
    return this.comments.create(body);
  }

  @Get('task/:taskId')
  byTask(@Param('taskId') taskId: string) {
    return this.comments.findForTask(taskId);
  }

  @Get('group/:groupId')
  byGroup(@Param('groupId') groupId: string) {
    return this.comments.findForGroup(groupId);
  }
}
