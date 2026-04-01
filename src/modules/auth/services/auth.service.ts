import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '@/modules/auth/services/users.service';
import { EmailSenderService } from '@/modules/auth/services/email-sender.service';
import type { User } from '@/modules/auth/entities/user.entity';
import type { JwtPayload } from '@/modules/auth/strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailSenderService: EmailSenderService,
  ) {}

  async requestMagicLink(email: string): Promise<void> {
    const user = await this.usersService.findOrCreate(email);
    const token = uuidv4();
    const expiresInSeconds = this.configService.get<number>('magicLink.expiresInSeconds') ?? 900;
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    await this.usersService.setMagicLinkToken(user.id, token, expiresAt);
    await this.emailSenderService.sendMagicLink(email, token);
    this.logger.log(`Magic link requested for ${email}`);
  }

  async verifyMagicLink(token: string) {
    const user = await this.usersService.findByMagicLinkToken(token);

    if (!user || !user.magicLinkExpiresAt) {
      throw new UnauthorizedException('Invalid magic link token');
    }

    if (user.magicLinkExpiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Magic link token has expired');
    }

    if (!user.isActive) {
      await this.usersService.activate(user.id);
    }

    await this.usersService.clearMagicLinkToken(user.id);

    return this.signToken(user);
  }

  getProfile(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  private signToken(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
    };
  }
}
