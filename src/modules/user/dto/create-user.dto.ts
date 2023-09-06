import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { User } from 'src/infra/database';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class CreateUserDtoResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
