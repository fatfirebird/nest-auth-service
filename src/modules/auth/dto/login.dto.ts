import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { User } from 'src/infra/database';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginUserDtoResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
