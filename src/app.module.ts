import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
const DB_RETRY_ATTEMPTS = 10;
const DB_RETRY_DELAY = 3_000;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('db.host'),
        port: configService.get<number>('db.port'),
        username: configService.get<string>('db.username'),
        password: configService.get<string>('db.password'),
        database: configService.get<string>('db.name'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('db.synchronize') ?? false,
        logging: configService.get<boolean>('db.logging') ?? false,
        retryAttempts: DB_RETRY_ATTEMPTS,
        retryDelay: DB_RETRY_DELAY,
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mailUser = configService.get<string>('mail.user') ?? '';
        const fromAddress = configService.get<string>('mail.from') ?? mailUser;

        if (!fromAddress) {
          throw new Error('Mail config invalid: set MAIL_FROM or MAIL_USER');
        }

        return {
          transport: {
            host: configService.get<string>('mail.host') ?? 'smtp.gmail.com',
            port: configService.get<number>('mail.port') ?? 587,
            secure: false,
            auth: {
              user: mailUser,
              pass: configService.get<string>('mail.pass') ?? '',
            },
          },
          defaults: {
            from: fromAddress,
          },
        };
      },
    }),
    AuthModule,
  ],
})
export class AppModule {}
