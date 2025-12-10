import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Post()
  create(
    @Body() body: { name: string; description?: string; ownerId: string },
  ) {
    return this.groups.create(body.name, body.description, body.ownerId);
  }

  @Get() findAll() {
    return this.groups.findAll();
  }

  @Post(':id/members/:userId')
  addMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.groups.addMember(id, userId);
  }

  @Post(':id/members/:userId/remove')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.groups.removeMember(id, userId);
  }
}
