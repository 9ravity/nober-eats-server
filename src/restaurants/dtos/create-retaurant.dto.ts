import { Field, InputType, OmitType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {
  /* id 제외하고 전부 받기, OmitType 사용 OmitType(Restaurant, ['id'], InputType) 
    OmitType은 무조건 inputType으로 해야됨, but Restaurant는 ObjectType이라서 InputType 명시
  */
}
