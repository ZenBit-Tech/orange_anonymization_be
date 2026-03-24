
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/modules/users/users.service';

export interface JwtPayload {
  sub: string;    // subject = user UUID
  email: string;
  role: string;
  iat?: number;   
  exp?: number;   
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      // Extract the JWT from the Authorization header as a Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Reject tokens whose exp claim has passed
      ignoreExpiration: false,
      // Secret used to verify the token signature (must match AuthService.signToken)
      secretOrKey: configService.get<string>('jwt.secret') ?? '',
    });
  }

 
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found');
    }
    return payload;
  }
}
