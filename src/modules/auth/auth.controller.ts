import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { User } from 'src/infra/database';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { RefreshDto } from './dto/refresh.dto';
import { AuthGuard } from 'src/core';

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

  @UseGuards(AuthGuard)
  @Delete('logout')
  @HttpCode(HttpStatus.CREATED)
  async logout(@Request() res) {
    const id = res.user?.id;

    await this.authService.deleteTokens(id);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshDto: RefreshDto) {
    const decodedToken = this.authService.decodeToken(refreshDto.refresh);

    if (!decodedToken) {
      return new BadRequestException('Invalid refresh token');
    }

    const isValidRefreshToken = await this.authService.isValidRefreshToken(
      decodedToken.id,
      refreshDto.refresh,
    );

    if (!isValidRefreshToken) {
      return new BadRequestException('Invalid refresh token');
    }

    const tokens = await this.authService.createTokens({
      email: decodedToken?.email,
      id: decodedToken?.id,
      login: decodedToken?.login,
    });

    if (!tokens) {
      return new BadRequestException('Invalid refresh token');
    }

    return tokens;
  }
}
