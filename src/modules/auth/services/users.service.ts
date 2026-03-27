import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import type { CreateUserDto } from '../dto/create-user.dto';
import type { UpdateUserDto } from '../dto/update-user.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/auth.guard';
@Injectable()
@UseGuards(JwtAuthGuard)
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      ...createUserDto,
      isActive: true,
    });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }


  async findByEmailWithToken(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.magicLinkToken')
      .addSelect('user.magicLinkExpiresAt')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByMagicLinkToken(token: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.magicLinkToken')
      .addSelect('user.magicLinkExpiresAt')
      .where('user.magicLinkToken = :token', { token })
      .getOne();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async setMagicLinkToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      magicLinkToken: token,
      magicLinkExpiresAt: expiresAt,
    });
  }

  async clearMagicLinkToken(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      magicLinkToken: null,
      magicLinkExpiresAt: null,
    });
  }

  async activate(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { isActive: true });
  }

  async findOrCreate(email: string): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) return existing;
    return this.create({ email });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}
