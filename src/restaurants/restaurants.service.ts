import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EditProfileOutput } from 'src/users/dtos/edit-profile.dto';
import { User } from 'src/users/entities/user.entity';
import { ILike, Like, Raw, Repository, TreeRepository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { DeleteRestaurantInput } from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(
        createRestaurantInput.name,
      );
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

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      /* object??? load?????? ????????? id??? load?????? ?????????  */
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'not found restaurant',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't owner",
        };
      }
      /* restaurant??? owner?????? restaurant??? ??????, true */
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      /* save??? id??? ????????? ????????? entity??? ???????????? ????????? id??? ????????????
        ????????? typeOrm??? ?????? entity??? ????????? update?????????.
      */
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && {
            category,
          }) /* category??? ????????????, category??? category??? object??? ??????*/,
        },
      ]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not edit Restaurant',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { id: restaurantId }: DeleteRestaurantInput,
  ) {
    try {
      /* check  */
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'not found restaurant',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't owner",
        };
      }

      /* ?????? delete ?????? */
      //await this.restaurants.delete(restaurantId);
      console.log('will restaurant', restaurant);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not delete restaurant.',
      };
    }
  }

  async findRestaurantById(
    restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantInput.id);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      return { ok: true, restaurant };
    } catch (error) {
      return {
        ok: false,
        error: 'not found Restaurant',
      };
    }
  }

  async SearchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: Raw((name) => `${name} ILIKE '%${query}%'`),
        },
      });
      /* pagination ?????? */
      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not search for Restaurant',
      };
    }
  }

  /*   updateRestaurant({ id, data }: UpdateRestaurantDto) {
    id??? ?????? ?????? row??? ????????? update
    return this.restaurants.update(id, { ...data });

    
      return this.restaurants.update({ name: 'asfj' }, { ...data }); 
      name??? asfj??? ?????? row??? ????????? update
    
  } */

  /* Category */
  async allCategories(): Promise<AllCategoriesOutput> {
    try {
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load Categories.',
      };
    }
  }

  async countRestaurants(category: Category) {
    return this.restaurants.count({ category }); // category??? count ?????? ??????
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      /* ?????? restaurant??? ???????????? ????????? db ????????? ??????. pagination ?????? */
      /* const category = await this.categories.findOne(
        { slug },
        { relations: ['restaurants'] },
      ); */
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      /* pagination take??? 25, 25?????? restaurant??? ?????????, page dafault:1, 1-1*25??? 0 skip??? 0 25??? ?????? ?????????, 2-1*25, 25?????? skip ??????, ?????? 26~50??? ?????????*/
      const restaurants = await this.restaurants.find({
        where: {
          category,
        },
        take: 25,
        skip: (page - 1) * 25,
      });
      category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);
      return {
        ok: true,
        category,
        restaurants,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load Category',
      };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * 25,
        take: 25,
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }
}
