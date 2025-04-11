export interface CreatingCommunitySettings {
  names?: string[];
  descriptions?: string[];
  categories?: { name: string }[];
  quorum: number;
  vote: number;
  significant_minority: number;
  decision_delay: number;
  dispute_time_limit: number;
  is_secret_ballot: boolean;
  is_can_offer: boolean;
  is_minority_not_participate: boolean;
  is_default_add_member: boolean;
  is_not_delegate: boolean;
  parent_community_id?: string;
}
