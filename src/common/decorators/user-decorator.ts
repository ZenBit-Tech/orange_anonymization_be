/**
 * @CurrentUser() decorator
 *
 * Extracts the authenticated user from the request object.
 * Use after applying @UseGuards(JwtAuthGuard).
 *
 * Usage:
 *   @Get('profile')
 *   @UseGuards(JwtAuthGuard)
 *   getProfile(@CurrentUser() user: JwtPayload) {
 *     return user;
 *   }
 */
import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '@/modules/auth/strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    return request.user;
  },
);
