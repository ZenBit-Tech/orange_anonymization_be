import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOkResponse({ type: [User] })
  getUsers(): Promise<User[]> {
    return this.authService.getUsers();
  }

  @Post()
  @ApiCreatedResponse({ type: User, description: 'Create a new user' })
  createUser(@Body() dto: CreateUserDto): Promise<User> {
    return this.authService.create(dto);
  }
}
