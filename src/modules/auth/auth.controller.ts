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
import { LoginUserDto, LoginUserDtoResponse } from './dto/login.dto';
import { Repository } from 'typeorm';
import { User } from 'src/infra/database';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { RefreshDto, RefreshDtoResponse } from './dto/refresh.dto';
import { AuthGuard } from 'src/core';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  @ApiExtraModels(LoginUserDtoResponse)
  @ApiOkResponse({
    status: 200,
    schema: {
      $ref: getSchemaPath(LoginUserDtoResponse),
    },
  })
  @ApiBadRequestResponse()
  @HttpCode(HttpStatus.OK)
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

  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Delete('logout')
  async logout(@Request() res) {
    const id = res.user?.id;

    await this.authService.deleteTokens(id);
  }

  @ApiExtraModels(RefreshDtoResponse)
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    status: 200,
    schema: {
      $ref: getSchemaPath(RefreshDtoResponse),
    },
  })
  @Post('refresh')
  async refreshToken(@Body() refreshDto: RefreshDto) {
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
