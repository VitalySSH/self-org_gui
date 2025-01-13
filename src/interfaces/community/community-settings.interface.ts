import {
    CategoryModel,
    CommunityDescriptionModel,
    CommunityNameModel,
    UserCommunitySettingsModel
} from "src/models";

export interface CommunitySettingsInterface {
    name: CommunityNameModel;
    description: CommunityDescriptionModel;
    categories?: CategoryModel[];
    sub_communities_settings?: UserCommunitySettingsModel[];
    quorum: number;
    vote: number;
    significant_minority: number;
    is_secret_ballot: boolean;
    is_can_offer: boolean;
    is_minority_not_participate: boolean;
    is_default_add_member: boolean;
    is_not_delegate: boolean;
    parent_community_id?: string;
}