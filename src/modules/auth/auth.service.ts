import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly dataSource: DataSource) {}

  async getUsers() {
    const users = await this.dataSource
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .getMany();

    return users;
  }
}
