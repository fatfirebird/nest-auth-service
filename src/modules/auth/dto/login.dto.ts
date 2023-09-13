import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { User } from 'src/infra/database';

export class LoginUserDto {
  @ValidateIf((dto) => !dto.email || dto.login)
  @IsString()
  @IsNotEmpty()
  login?: string;

  @ValidateIf((dto) => !dto.login || dto.email)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginUserDtoResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
