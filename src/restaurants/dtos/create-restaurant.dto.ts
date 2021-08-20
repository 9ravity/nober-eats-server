import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core-output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImg',
  'address',
]) {
  @Field((type) => String)
  categoryName: string;
}
// categoryName은 원래 Admin에서 생성해서 선택을 할 수 있도록 제어해야함,

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
