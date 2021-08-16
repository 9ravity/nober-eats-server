import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field((type) => String)
  code: string;

  @OneToOne((type) => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  /* code 는 필수 이므로, hook(@BeforeInsert)이 없으면 error */
  @BeforeInsert()
  createCode(): void {
    this.code = uuidv4();
  }
}
