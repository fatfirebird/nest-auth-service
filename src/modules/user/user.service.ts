import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/infra/database';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { GetUserByEmailOrLoginDto } from './dto/get-user-by-login-or-email.dto';
import { IsValidPasswordDto } from './dto/is-valid-password.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private dataSource: DataSource,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    let data = { accessToken: null, refreshToken: null, user: null };

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hash = await bcrypt.hash(createUserDto.password, 10);

      const newUser = queryRunner.manager.create(User, {
        ...createUserDto,
        password: hash,
      });

      const user = await queryRunner.manager.save(newUser);

      const { accessToken, refreshToken } = await this.authService.createTokens(
        user,
      );

      await queryRunner.commitTransaction();

      data = {
        accessToken,
        refreshToken,
        user,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error('Creating user error');
    } finally {
      await queryRunner.release();
    }

    return data;
  }

  async getUserByLoginOrEmail(
    getUserByEmailOrLoginDto: GetUserByEmailOrLoginDto,
  ) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.login = :login', {
        login: getUserByEmailOrLoginDto.login,
      })
      .orWhere('user.email = :email', { email: getUserByEmailOrLoginDto.email })
      .getOne();

    return user;
  }

  async isValidPassword(isValidPasswordDto: IsValidPasswordDto) {
    const isValidPassword = await bcrypt.compare(
      isValidPasswordDto.passwrod,
      isValidPasswordDto.hashPassword,
    );

    return isValidPassword;
  }
}
