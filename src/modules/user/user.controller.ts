import {
  Controller,
  Get,
  Post,
  Body,
  ClassSerializerInterceptor,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Request,
  NotFoundException,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserDtoResponse } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from 'src/infra/database';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthGuard } from 'src/core';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiException(
    () => new BadRequestException('User with same credentials alredy exists'),
  )
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserDtoResponse> {
    const sameUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.login = :login', {
        login: createUserDto.login,
      })
      .orWhere('user.email = :email', { email: createUserDto.email })
      .getOne();

    if (sameUser) {
      throw new BadRequestException('User with same credentials alredy exists');
    }

    return await this.userService.create(createUserDto);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiException(() => [UnauthorizedException, NotFoundException])
  @UseGuards(AuthGuard)
  @Get()
  async findOne(@Request() req): Promise<User> {
    if (req?.user) {
      return req?.user;
    }

    throw new NotFoundException();
  }
}
