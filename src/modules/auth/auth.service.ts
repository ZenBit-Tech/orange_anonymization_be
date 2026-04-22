import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { EmailSenderService } from '@/modules/email/services/email-sender.service';
import { LoginMessageDto } from './dto/login-message.dto';
import { VerifyResponseDto } from './dto/verify-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailSenderService,
  ) {}

  async login(email: string): Promise<LoginMessageDto> {
    const user = await this.usersService.upsert(email);
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return await this.emailService.requestMagicLink(email, token);
  }

  async verify(token: string): Promise<VerifyResponseDto> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
