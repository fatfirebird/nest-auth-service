import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { User } from 'src/infra/database';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  login: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({ minLength: 8 })
  password: string;
}

export class LoginUserDtoResponse extends User {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
