import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { EmailSenderService } from './services/email-sender.service';

@Module({
  controllers: [AuthController],
  providers: [EmailSenderService],
})
export class AuthModule {}
