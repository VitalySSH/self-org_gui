import {
  CategoryModel,
  CommunityDescriptionModel,
  CommunityNameModel,
  ResponsibilityModel,
  UserCommunitySettingsModel,
} from 'src/models';

export interface CommunitySettingsInterface {
  names: CommunityNameModel[];
  descriptions: CommunityDescriptionModel[];
  categories?: CategoryModel[];
  sub_communities_settings?: UserCommunitySettingsModel[];
  responsibilities?: ResponsibilityModel[];
  quorum: number;
  vote: number;
  significant_minority: number;
  is_secret_ballot: boolean;
  decision_delay: number;
  dispute_time_limit: number;
  is_workgroup: boolean;
  workgroup?: number;
  is_can_offer: boolean;
  is_minority_not_participate: boolean;
  is_default_add_member: boolean;
  is_not_delegate: boolean;
  parent_community_id?: string;
}
