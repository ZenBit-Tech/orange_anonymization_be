import { User } from '@/modules/users/user.entity';
import { UserResponse } from '@/modules/users/interfaces/user-response.interface';

export class UserMapper {
  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
