import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core-output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class DeleteRestaurantInput extends PickType(Restaurant, ['id']) {}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
