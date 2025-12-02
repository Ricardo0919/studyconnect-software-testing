import { Body, Controller, Get, Param, Patch, Post, UsePipes, ValidationPipe, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  private static validationPipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    stopAtFirstError: true,
    validationError: { target: false, value: false },
  });

  @Post('register')
  @UsePipes(UsersController.validationPipe)
  register(@Body() dto: RegisterUserDto) {
    return this.users.register(dto);
  }

  @Post('login')
  @UsePipes(UsersController.validationPipe)
  login(@Body() dto: LoginUserDto) {
    return this.users.login(dto.email, dto.password);
  }

  @Get()
  findAll() {
    return this.users.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.users.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Patch(':id')
  @UsePipes(UsersController.validationPipe)
  updateProfile(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(id, dto);
  }

  @Patch(':id/role')
  @UsePipes(UsersController.validationPipe)
  changeRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.users.assignRole(id, dto.role);
  }
}
