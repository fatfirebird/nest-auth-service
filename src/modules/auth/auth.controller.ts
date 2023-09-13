import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  forwardRef,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, LoginUserDtoResponse } from './dto/login.dto';
import { RefreshDto, RefreshDtoResponse } from './dto/refresh.dto';
import { AuthGuard } from 'src/core';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { UserService } from '../user/user.service';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  @ApiException(() => new BadRequestException('Invalid credentials'))
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<LoginUserDtoResponse> {
    const user = await this.userService.getUserByLoginOrEmail({
      email: loginUserDto.email,
      login: loginUserDto.login,
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isValidPassword = await this.userService.isValidPassword({
      passwrod: loginUserDto.password,
      hashPassword: user.password,
    });

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

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiException(() => UnauthorizedException)
  @HttpCode(HttpStatus.CREATED)
  @Delete('logout')
  async logout(@Request() req) {
    const id = req.user?.id;

    await this.authService.deleteTokens(id);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiException(() => [
    UnauthorizedException,
    new BadRequestException('Invalid refresh token'),
  ])
  @Post('refresh')
  async refreshToken(
    @Body() refreshDto: RefreshDto,
  ): Promise<RefreshDtoResponse> {
    const decodedToken = this.authService.decodeToken(refreshDto.refresh);

    if (!decodedToken) {
      throw new BadRequestException('Invalid refresh token');
    }

    const isValidRefreshToken = await this.authService.isValidRefreshToken(
      decodedToken.id,
      refreshDto.refresh,
    );

    if (!isValidRefreshToken) {
      throw new BadRequestException('Invalid refresh token');
    }

    const tokens = await this.authService.createTokens({
      email: decodedToken?.email,
      id: decodedToken?.id,
      login: decodedToken?.login,
    });

    if (!tokens) {
      throw new BadRequestException('Invalid refresh token');
    }

    return tokens;
  }
}
