import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refresh: string;
}

export class RefreshDtoResponse {
  accessToken: string;
  refreshToken: string;
}
