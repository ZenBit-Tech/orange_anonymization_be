import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { FakeDataService } from './fake-data.service';
import { SyntheticDataController } from './synthetic-data.controller';
import { SyntheticDataService } from './synthetic-data.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>('auth.jwtExpiresIn'),
        },
      }),
    }),
  ],
  controllers: [SyntheticDataController],
  providers: [FakeDataService, SyntheticDataService],
})
export class SyntheticDataModule {}
