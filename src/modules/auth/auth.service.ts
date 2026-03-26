
import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/modules/users/users.service';
import type { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async requestMagicLink(email: string): Promise<void> {
    
  }
  async verifyMagicLink(token: string) {
   
  }
  
  getProfile(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }
  private signToken(user: User) {
    
  }
}
