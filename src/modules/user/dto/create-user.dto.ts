import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/infra/database';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  login: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({ minLength: 8 })
  password: string;
}

export class CreateUserDtoResponse extends User {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
