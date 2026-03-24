
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { TestDbModule } from "../src/database/test.module"
// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DeIdentificationModule } from './modules/de-identification/de-identification.module';
import { SyntheticDataModule } from './modules/synthetic-data/synthetic-data.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

// Entities — TypeORM needs to know about all entities for auto-migrations
import { User } from './modules/users/entities/user.entity';
import { Document } from './modules/de-identification/entities/document.entity';
import { SyntheticRecord } from './modules/synthetic-data/entities/synthetic-record.entity';

@Module({
  imports: [
    //  Config 
    ConfigModule.forRoot({
      isGlobal: true,               // Global re-injectable config
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
        entities: [User, Document, SyntheticRecord],
        synchronize: configService.get<boolean>('db.synchronize') ?? false,
        logging: configService.get<boolean>('db.logging') ?? false,
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),


    // Feature Modules 
    AuthModule,
    UsersModule,
    DeIdentificationModule,
    SyntheticDataModule,
    DashboardModule,
    TestDbModule
  ]
  
})
export class AppModule {}
