import { ApiModel } from './api-model.model.ts';
import { attribute, manyToMany, modelConfig, oneToMany } from 'src/annotations';
import { UserModel } from './user.model.ts';
import { CommunityNameModel } from './community-name.model.ts';
import { CommunityDescriptionModel } from './community-description.model.ts';
import { CategoryModel } from './category.model.ts';
import { ResponsibilityModel } from './responsibility.model.ts';
import { CommunityModel } from 'src/models/community.model.ts';

@modelConfig({
  entityName: 'user_community_settings',
})
export class UserCommunitySettingsModel extends ApiModel {
  @oneToMany('auth_user')
  user?: UserModel;

  @attribute()
  community_id!: string;

  @attribute()
  parent_community_id?: string;

  @oneToMany('community')
  community?: CommunityModel;

  @manyToMany('community_name')
  names?: CommunityNameModel[];

  @manyToMany('community_description')
  descriptions?: CommunityDescriptionModel[];

  @attribute()
  quorum!: number;

  @attribute()
  vote!: number;

  @attribute()
  significant_minority!: number;

  @attribute()
  decision_delay!: number;

  @attribute()
  dispute_time_limit!: number;

  @attribute()
  is_workgroup!: boolean;

  @attribute()
  workgroup?: number;

  @attribute()
  is_secret_ballot!: boolean;

  @attribute()
  is_can_offer!: boolean;

  @attribute()
  is_minority_not_participate!: boolean;

  @manyToMany('category')
  categories?: CategoryModel[];

  @manyToMany('user_community_settings')
  sub_communities_settings?: UserCommunitySettingsModel[];

  @manyToMany('responsibility')
  responsibilities?: ResponsibilityModel[];

  @attribute()
  is_not_delegate!: boolean;

  @attribute()
  is_default_add_member!: boolean;

  @attribute()
  is_blocked!: boolean;
}
