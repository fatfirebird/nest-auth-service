import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { User } from 'src/infra/database';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.login = :login', {
        login: loginUserDto.login,
      })
      .orWhere('user.email = :email', { email: loginUserDto.login })
      .getOne();

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.authService.createTokens(
      user,
    );

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  @Delete('logout')
  async logout() {}

  @Post('refresh')
  async refreshToken() {}
}
