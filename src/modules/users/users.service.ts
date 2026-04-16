import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async upsert(email: string): Promise<User> {
    await this.usersRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({ email })
      .orIgnore()
      .execute();

    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new InternalServerErrorException('User was not created or found');
    }

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
    });
  }
}
