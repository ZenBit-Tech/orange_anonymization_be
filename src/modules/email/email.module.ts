import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailSenderService } from './services/email-sender.service';

@Module({
  imports: [MailerModule],
  providers: [EmailSenderService],
  exports: [EmailSenderService],
})
export class EmailModule {}
