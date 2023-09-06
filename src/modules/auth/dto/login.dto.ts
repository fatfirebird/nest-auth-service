import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @MinLength(8)
  password: string;
}
