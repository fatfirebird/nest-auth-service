import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/infra/database';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private dataSource: DataSource,
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
}
