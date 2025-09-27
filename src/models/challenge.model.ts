import { ApiModel } from './api-model.model.ts';
import { modelConfig, attribute, oneToMany, manyToMany } from 'src/annotations';
import { StatusModel } from './status.model.ts';
import { UserModel } from 'src/models/user.model.ts';
import { CategoryModel } from 'src/models/category.model.ts';
import { SolutionModel } from 'src/models/solution.model.ts';

@modelConfig({
  entityName: 'challenge',
})
export class ChallengeModel extends ApiModel {
  @attribute()
  title!: string;

  @attribute()
  description!: string;

  @attribute()
  community_id!: string;

  @oneToMany('status')
  status?: StatusModel;

  @oneToMany('auth_user')
  creator?: UserModel;

  @oneToMany('category')
  category?: CategoryModel;

  @oneToMany('category')
  old_category?: CategoryModel;

  @manyToMany('solution')
  solutions?: SolutionModel[];
}
