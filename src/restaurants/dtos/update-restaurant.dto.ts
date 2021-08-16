import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDto } from './create-retaurant.dto';

@InputType()
class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto) {
  /* 
  update를 위해선 반드시 id가 필요
    inputType을 생성
  */
}

@InputType()
export class UpdateRestaurantDto {
  @Field((type) => Number)
  id: number;

  @Field((type) => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
