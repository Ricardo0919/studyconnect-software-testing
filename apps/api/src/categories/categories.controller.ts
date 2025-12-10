import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Post() create(@Body() body: { name: string; description?: string }) {
    return this.categories.create(body.name, body.description);
  }

  @Get() findAll() {
    return this.categories.findAll();
  }

  @Get(':id') findOne(@Param('id') id: string) {
    return this.categories.findOne(id);
  }
}
