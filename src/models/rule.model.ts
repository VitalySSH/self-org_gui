import { ApiModel } from './api-model.model.ts';
import { attribute, modelConfig, oneToMany } from 'src/annotations';
import { UserModel } from './user.model.ts';
import { StatusModel } from './status.model.ts';
import { CategoryModel } from './category.model.ts';
import { VotingResultModel } from './voting-result.model.ts';

@modelConfig({
  entityName: 'rule',
})
export class RuleModel extends ApiModel {
  @attribute()
  title?: string;

  @attribute()
  question?: string;

  @attribute()
  content?: string;

  @attribute()
  is_extra_options?: boolean;

  @attribute()
  is_multi_select?: boolean;

  @attribute()
  community_id?: string;

  @oneToMany('auth_user')
  creator?: UserModel;

  @attribute(Date)
  created?: Date;

  @oneToMany('status')
  status?: StatusModel;

  @oneToMany('category')
  category?: CategoryModel;

  @oneToMany('voting_result')
  voting_result?: VotingResultModel;

  @attribute()
  extra_question?: string;
}
