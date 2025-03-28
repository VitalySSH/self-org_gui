import { ApiModel } from './api-model.model.ts';
import { attribute, manyToMany, modelConfig, oneToMany } from 'src/annotations';
import { UserModel } from './user.model.ts';
import { CommunityNameModel } from './community-name.model.ts';
import { CommunityDescriptionModel } from './community-description.model.ts';
import { CategoryModel } from './category.model.ts';
import { RequestMemberModel } from './request-member.model.ts';
import { DelegateSettingsModel } from './delegate-settings.model.ts';

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

  @oneToMany('community_name')
  name!: CommunityNameModel;

  @oneToMany('community_description')
  description!: CommunityDescriptionModel;

  @attribute()
  quorum!: number;

  @attribute()
  vote!: number;

  @attribute()
  significant_minority!: number;

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

  @manyToMany('delegate_settings')
  delegate_settings?: DelegateSettingsModel[];

  @attribute()
  is_not_delegate!: boolean;

  @attribute()
  is_default_add_member!: boolean;

  @attribute()
  is_blocked!: boolean;

  @manyToMany('request_member')
  adding_members?: RequestMemberModel[];
}
