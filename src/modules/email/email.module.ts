import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailSenderService } from './services/email-sender.service';
import { EmailController } from './email.controller';

@Module({
  imports: [MailerModule],
  providers: [EmailSenderService],
  exports: [EmailSenderService],
  controllers: [EmailController],
})
export class EmailModule {}
