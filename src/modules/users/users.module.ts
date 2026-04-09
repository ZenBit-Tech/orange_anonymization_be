import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Підключаємо User entity до репозиторію
  providers: [UsersService],
  exports: [UsersService], // Експортуємо сервіс, щоб інші модулі (наприклад AuthModule) могли його використовувати
})
export class UsersModule {}
