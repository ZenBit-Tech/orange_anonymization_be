import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { CurrentUserDto } from './dto/current-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getMe(@CurrentUser() user: CurrentUserDto): Promise<UserResponseDto> {
    return this.usersService.getCurrentUser(user.id);
  }
}
