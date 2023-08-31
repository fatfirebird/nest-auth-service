import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

const configService = new ConfigService();

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  url: configService.get('DATABASE_URL'),
  entities: [`${__dirname}/entities/**/*{.ts,.js}`],
  migrations: [`${__dirname}/migrations/**/*{.ts,.js}`],
  migrationsRun: true,
  autoLoadEntities: true,
};

export default new DataSource(typeOrmModuleOptions as DataSourceOptions);
