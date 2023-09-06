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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserDtoResponse } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from 'src/infra/database';
import { InjectRepository } from '@nestjs/typeorm';
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
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  @ApiExtraModels(CreateUserDtoResponse)
  @ApiOkResponse({
    status: 200,
    schema: {
      $ref: getSchemaPath(CreateUserDtoResponse),
    },
  })
  @ApiBadRequestResponse({
    description: 'User with same credentials alredy exists',
  })
  @HttpCode(HttpStatus.OK)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
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

  @ApiExtraModels(User)
  @ApiOkResponse({
    status: 200,
    schema: {
      $ref: getSchemaPath(User),
    },
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse()
  @UseGuards(AuthGuard)
  @Get()
  async findOne(@Request() req) {
    if (req?.user) {
      return req?.user;
    }

    throw new NotFoundException();
  }
}
