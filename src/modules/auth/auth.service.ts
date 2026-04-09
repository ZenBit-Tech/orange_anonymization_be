import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(email: string) {
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create(email);
    }

    return user;
  }
}
