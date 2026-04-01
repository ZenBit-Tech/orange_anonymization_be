import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly dataSource: DataSource) {}

  async getUsers(): Promise<User[]> {
    return this.dataSource.getRepository(User).find();
  }

  async create(dto: CreateUserDto): Promise<User> {
    try {
      const user = this.dataSource.getRepository(User).create(dto);
      return await this.dataSource.getRepository(User).save(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }
}
