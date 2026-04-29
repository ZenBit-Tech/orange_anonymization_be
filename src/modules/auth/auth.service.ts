import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { EmailSenderService } from '@/modules/email/services/email-sender.service';
import { LoginMessageDto } from './dto/login-message.dto';
import { VerifyResponseDto } from './dto/verify-response.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailSenderService,
  ) {}

  async login(email: string): Promise<LoginMessageDto> {
    const user = await this.usersService.upsert(email);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersService.updateMagicLink(user.id, token, expiresAt);

    return this.emailService.requestMagicLink({
      email,
      token,
    });
  }

  async verify(token: string): Promise<VerifyResponseDto> {
    const cleanToken = token.trim();
    const user = await this.usersService.findByMagicLinkToken(cleanToken);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    const now = new Date();

    if (!user.magicLinkExpiresAt || user.magicLinkExpiresAt < now) {
      throw new UnauthorizedException('Token expired');
    }

    await this.usersService.clearMagicLink(user.id);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { accessToken };
  }
}
