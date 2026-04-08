import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthController } from './auth.controller';
import { EmailSenderService } from './services/email-sender.service';

@Module({
  imports: [MailerModule],
  controllers: [AuthController],
  providers: [EmailSenderService],
})
export class AuthModule {}
