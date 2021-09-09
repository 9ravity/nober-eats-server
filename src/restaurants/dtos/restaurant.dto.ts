import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core-output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class RestaurantInput extends PickType(Restaurant, ['id']) {}

@ObjectType()
export class RestaurantOutput extends CoreOutput {
  @Field((type) => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
