import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TestService implements OnModuleInit {
  private readonly logger = new Logger(TestService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.test();
  }

  async test() {
    try {
      await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([{ email: 'test@gmail.com', role: 'analyst' }])
        .execute();

      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email: 'test@gmail.com' })
        .getOne();

      this.logger.log('DB works! User:', JSON.stringify(user));
    } catch (error) {
      this.logger.error('DB test failed', error);
    }
  }
}
