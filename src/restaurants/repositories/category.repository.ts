import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category> {
    /* 앞 뒤 빈칸을 지우기 위함, 소문자로 변경 */
    const categoryName = name.trim().toLowerCase();
    /* 중간 빈칸을 - 로 변경 */
    const categorySlug = categoryName.replace(/ /g, '-');
    /* this는 현재 repository : CategoryRepository*/
    let category = await this.findOne({ name: categorySlug });
    if (!category) {
      category = await this.save(
        this.create({ slug: categorySlug, name: categoryName }),
      );
    }
    return category;
  }
}
