import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { EmailSenderService } from '../email/services/email-sender.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailSenderService,
  ) {}

  async login(email: string) {
    const user = await this.usersService.upsert(email);

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return await this.emailService.requestMagicLink(email, token);
  }
}
