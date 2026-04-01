import { IsEmail, IsString, MinLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH } from 'src/common/constants/app.constants';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  password: string;
}
