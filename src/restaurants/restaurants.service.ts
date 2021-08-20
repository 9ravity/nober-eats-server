import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async createRestaurant(
    owner: User,
    CreateRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(CreateRestaurantInput);
      newRestaurant.owner = owner;
      /* 앞 뒤 빈칸을 지우기 위함, 소문자로 변경 */
      const categoryName = CreateRestaurantInput.categoryName
        .trim()
        .toLowerCase();
      /* 중간 빈칸을 - 로 변경 */
      const categorySlug = categoryName.replace(/ /g, '-');
      let category = await this.categories.findOne({ name: categorySlug });
      if (!category) {
        category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categoryName }),
        );
      }
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  /*   updateRestaurant({ id, data }: UpdateRestaurantDto) {
    id가 같은 모든 row를 찾아서 update
    return this.restaurants.update(id, { ...data });

    
      return this.restaurants.update({ name: 'asfj' }, { ...data }); 
      name이 asfj인 모든 row를 찾아서 update
    
  } */
}
