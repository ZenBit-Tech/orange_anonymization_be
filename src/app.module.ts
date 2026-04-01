import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import configuration from './config/configuration';
import { TestDbModule } from './database/test.module';
// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { FileUpload } from './modules/file-upload/file-upload.module';
import { DeIdentificationModule } from './modules/presidio/persido.module';

// Entities — TypeORM needs to know about all entities for auto-migrations
import { User } from './modules/auth/entities/user.entity';
import { Document } from './modules/presidio/entities/document.entity';

@Module({
  imports: [
    //  Config
    ConfigModule.forRoot({
      isGlobal: true, // Global re-injectable config
      load: [configuration],
      envFilePath: '.env',
    }),

    //  Database
    TypeOrmModule.forRootAsync({
      // registerAsync reads configuration AFTER ConfigModule has loaded .env
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('db.host'),
        port: configService.get<number>('db.port'),
        username: configService.get<string>('db.username'),
        password: configService.get<string>('db.password'),
        database: configService.get<string>('db.name'),
        entities: [User, Document],
        synchronize: configService.get<boolean>('db.synchronize') ?? false,
        logging: configService.get<boolean>('db.logging') ?? false,
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),

    // Feature Modules
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('mail.host') ?? 'smtp.gmail.com',
          port: configService.get<number>('mail.port') ?? 587,
          secure: false,
          auth: {
            user: configService.get<string>('mail.user') ?? '',
            pass: configService.get<string>('mail.appPassword') ?? '',
          },
        },
        defaults: {
          from: configService.get<string>('mail.from') ?? '',
        },
      }),
    }),
    AuthModule,
    FileUpload,
    DeIdentificationModule,
    TestDbModule,
  ],
})
export class AppModule {}
