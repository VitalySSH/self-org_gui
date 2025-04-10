import { ApiModel } from './api-model.model.ts';
import { attribute, manyToMany, modelConfig, oneToMany } from 'src/annotations';
import { CommunityDescriptionModel } from './community-description.model.ts';
import { CommunityNameModel } from './community-name.model.ts';
import { CategoryModel } from './category.model.ts';
import { UserCommunitySettingsModel } from './user-community-settings.model.ts';
import { ResponsibilityModel } from './responsibility.model.ts';

@modelConfig({
  entityName: 'community_settings',
})
export class CommunitySettingsModel extends ApiModel {
  @oneToMany('community_name')
  name?: CommunityNameModel;

  @oneToMany('community_description')
  description?: CommunityDescriptionModel;

  @attribute()
  quorum?: number;

  @attribute()
  vote?: number;

  @attribute()
  significant_minority?: number;

  @attribute()
  decision_delay?: number;

  @attribute()
  dispute_time_limit?: number;

  @attribute()
  is_secret_ballot?: boolean;

  @attribute()
  is_can_offer?: boolean;

  @attribute()
  is_minority_not_participate?: boolean;

  @manyToMany('category')
  categories?: CategoryModel[];

  @manyToMany('user_community_settings')
  sub_communities_settings?: UserCommunitySettingsModel[];

  @manyToMany('responsibility')
  responsibilities?: ResponsibilityModel[];
}
