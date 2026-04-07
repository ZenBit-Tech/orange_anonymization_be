import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';

const DB_RETRY_ATTEMPTS = 10;
const DB_RETRY_DELAY = 3_000;

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
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('db.synchronize') ?? false,
        logging: configService.get<boolean>('db.logging') ?? false,
        retryAttempts: DB_RETRY_ATTEMPTS,
        retryDelay: DB_RETRY_DELAY,
      }),
    }),
  ],
})
export class AppModule {}
