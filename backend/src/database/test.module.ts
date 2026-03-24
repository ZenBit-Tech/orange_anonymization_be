import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestService } from './test.service';
import { User } from "../modules/users/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [TestService],
})
export class TestDbModule {}