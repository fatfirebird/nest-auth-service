import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user')
export class User {
  @ApiProperty({ type: 'number' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({
    nullable: false,
    unique: true,
  })
  email: string;

  @ApiProperty()
  @Column({
    nullable: false,
    unique: true,
  })
  login: string;

  @Exclude()
  @Column({
    nullable: false,
  })
  password?: string;
}

export default User;
