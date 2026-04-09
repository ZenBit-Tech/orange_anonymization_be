import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string) {
    const user = await this.usersService.upsert(email);

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { user, accessToken: token };
  }
}
