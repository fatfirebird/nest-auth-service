import { IsString } from 'class-validator';

export class IsValidPasswordDto {
  @IsString()
  passwrod: string;

  @IsString()
  hashPassword: string;
}
